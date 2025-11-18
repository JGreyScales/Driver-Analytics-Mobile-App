const JWT_AUTH = require("../middleware/auth")
let Database = require("../models/db")
let dataTypes = require("../utils/dataType")

class User {
    "ONLY ALIVE FOR ONE CYCLE, ONCE A COMMAND IS RAN THEY WILL CLOSE THEIR CONNECTION"
    constructor(testing = false) {
        this.db = new Database(testing)
    }

    async userCreate(body) {
        try {
            await this.db.connect()
            const query = `INSERT INTO ${this.db.usersTable} (username, email, passwordHash) VALUES (?, ?, ?)`
            const insertScoreTableQuery = `INSERT INTO ${this.db.userScoreTable} (userID) VALUES (?)`
            const params = [body.username, body.email, body.passwordHash]
            params.forEach(element => {
                if (!dataTypes.isDefined(element)) {throw {statusCode: 400, message: "Required element not defined"}}
            });

            const results = await this.db.submitQuery(query, params)

            const insertScoreTableParams = [results.insertId]

            await this.db.submitQuery(insertScoreTableQuery, insertScoreTableParams)
            return {statusCode: 201, message: 'User created successfully'}
        } 
        catch (e) {
            if (dataTypes.isDict(e)){
                return e
            } else {
                console.log(e)
                return {statusCode: 500, message: 'Unknown serverside error'}
            }
        } finally {
            await this.db.close()
        }
    }

    async deleteUser(userID) {
        try {
            if (!dataTypes.isDefined(userID) || !dataTypes.isID(userID)) {throw {statusCode: 400, message: "Invalid UserID"}}

            await this.db.connect()
            const query = `DELETE FROM ${this.db.usersTable} WHERE userID = ?`
            const deleteScoreQuery = `DELETE FROM ${this.db.userScoreTable} WHERE userID = ?`
            const deleteDrivesQuery = `DELETE T FROM ${this.db.tripsTable} T JOIN ${this.db.userBridgeTable} UBS ON T.tripID = UBS.tripID WHERE UBS.userID = ?`
            const deleteBridgeQuery = `DELETE FROM ${this.db.userBridgeTable} WHERE userID = ?`
            const params = [userID]

            await this.db.submitQuery(query, params)
            await this.db.submitQuery(deleteScoreQuery, params)
            try {
                await this.db.submitQuery(deleteDrivesQuery, params)
                await this.db.submitQuery(deleteBridgeQuery, params)
            } catch (sqlE) {
                console.log("No drives to remove for this user")
                console.log(sqlE)
            }

        
            return {statusCode: 200, message: `User successfully deleted with ID:${userID}`}
        } catch (e) {
            if (dataTypes.isDict(e)) {
                return e
            } else {
                return {statusCode: 500, message: 'Unknown serverside error'}
            }
        } finally {
            await this.db.close()
        } 
    }

    async getUserDetails(userID) {
        try{
            if (!dataTypes.isID(userID)) {throw {statusCode: 400, message: "Invalid userID"}}
            const query = `
                SELECT u.username, s.score, s.tripCount
                FROM ${this.db.usersTable} AS u
                JOIN ${this.db.userScoreTable} AS s
                    ON u.userID = s.userID
                WHERE u.userID = ?
            `;
            const params = [userID]

            await this.db.connect()
            const response = await this.db.fetchQuery(query, params)
            if (!dataTypes.isDefined(response[0].username) || !dataTypes.exists(response[0].score)) {throw {statusCode: 404, message: "User not found"}}

            return {statusCode:200, message:"User data gathered", data: response[0]}
        } catch (e) {
            if (dataTypes.isDict(e)) {
                return e
            } else {
                return {statusCode: 500, message: 'Unknown serverside error'}
            } 
        } finally {
            await this.db.close()
        }
    }

    async authenticateUser(body) {
        try{
            if (!dataTypes.isDefined(body.username) || !dataTypes.isDefined(body.passwordHash)) {throw {statusCode: 400, message: "Invalid parameters"}}
            await this.db.connect()
            const query = `SELECT userID, passwordHash FROM ${this.db.usersTable} WHERE username = ? LIMIT 1`
            const params = [body.username]

            const response = await this.db.fetchQuery(query, params)
            if (!dataTypes.isDefined(response[0].userID)) {throw {statusCode: 400, message: "Couldnt gather userID"}}
            if (!dataTypes.isDefined(response[0].passwordHash)) {throw {statusCode: 400, message: "Couldnt gather passwordHash"}}
            // passwords dont match
            if (response[0].passwordHash !== body.passwordHash){
                return {statusCode: 401, message: 'User is not authenticated'}
            }

            return {statusCode: 202, message: 'User authenticated', token: `Bearer ${JWT_AUTH.generateToken(response[0].userID)}`}

        } catch (e) {
            if (dataTypes.isDict(e)) {
                return e
            } else {
                return {statusCode: 500, message: 'Unknown serverside error'}
            } 
        } finally {
            await this.db.close()
        }
    }

    async updateUserDetails(body, userID) {
        try {
            if (!dataTypes.isID(userID) || Object.keys(body).length === 0) {
                throw { statusCode: 400, message: "Invalid parameters" };
            }

            await this.db.connect();

            const fields = Object.keys(body).map(f => `'${f}'`).join(',');
            // Query information_schema to determine table for each column
            const schemaQuery = `
                SELECT TABLE_NAME, COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND COLUMN_NAME IN (${fields})
            `;

            const schemaResults = await this.db.fetchQuery(schemaQuery, []);

            // Group fields by table
            const tableFields = {};
            for (let row of schemaResults) {
                const table = row.TABLE_NAME;
                const col = row.COLUMN_NAME;
                if (!tableFields[table]) tableFields[table] = [];
                tableFields[table].push(col);
            }

            // Build multi-table UPDATE query dynamically
            const tables = Object.keys(tableFields);
            const firstTable = tables[0];
            const joins = [];
            const setClauses = [];
            const valuesList = [];

            for (let table of tables) {
                if (table !== firstTable) {
                    joins.push(`JOIN ${table} AS ${table} ON ${firstTable}.userID = ${table}.userID`);
                }
                for (let col of tableFields[table]) {
                    setClauses.push(`${table}.${col} = ?`);
                    valuesList.push(body[col]);
                }
            }

            const query = `
                UPDATE ${firstTable} AS ${firstTable}
                ${joins.join(' ')}
                SET ${setClauses.join(', ')}
                WHERE ${firstTable}.userID = ?
                LIMIT 1
            `;
            valuesList.push(userID);

            await this.db.submitQuery(query, valuesList);

            return { statusCode: 200, message: 'User updated' };

        } catch (e) {
            if (dataTypes.isDict(e)) {
                return e;
            } else {
                return { statusCode: 500, message: 'Unknown serverside error' };
            }
        } finally {
            await this.db.close();
        }
    }


}

module.exports = User