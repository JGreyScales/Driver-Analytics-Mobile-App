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
            const params = [body.username, body.email, body.passwordHash]
            params.forEach(element => {
                if (!dataTypes.isDefined(element)) {throw {statusCode: 400, message: "Required element not defined"}}
            });

            await this.db.submitQuery(query, params)
            return {statusCode: 201, message: 'User created successfully'}
        } 
        catch (e) {
            if (dataTypes.isDict(e)){
                return e
            } else {
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
            const params = [userID]

            await this.db.submitQuery(query, params)
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
            const query = `SELECT username, score FROM ${this.db.usersTable} WHERE userID = ? LIMIT 1`
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
            const query = `SELECT userID FROM ${this.db.usersTable} WHERE username = ? AND passwordHash = ? LIMIT 1`
            const params = [body.username, body.passwordHash]

            const response = await this.db.fetchQuery(query, params)
            if (!dataTypes.isDefined(response[0].userID)) {throw {statusCode: 400, message: "Couldnt gather userID"}}

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

    async updateUserDetails(body, userID){
        try{
            if (!dataTypes.isID(userID) || Object.keys(body).length === 0) {throw {statusCode: 400, message: "Invalid parameters"}}
            await this.db.connect()
            let query = `UPDATE ${this.db.usersTable} SET `
            const updates = [];
            const valuesList = [];

            for (let field in body) {
                updates.push(`${field} = ?`)
                valuesList.push(body[field])
            }

            query += updates.join(', ') + " WHERE userID = ?";
            valuesList.push(userID);

            await this.db.submitQuery(query, valuesList)
            return {statusCode: 200, message: 'User updated'}

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
}

module.exports = User