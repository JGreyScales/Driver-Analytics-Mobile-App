let Database = require("../models/db")
let dataTypes = require("../utils/dataType")

class User {
    constructor(testing = false) {
        this.db = new Database(testing)
    }

    async userCreate(body) {
        try {
            await this.db.connect()
            const query = `INSERT INTO ${this.db.usersTable} (username, email, passwordHash) VALUES (?, ?, ?)`
            const params = [body.username, body.email, body.passwordHash]
            params.forEach(element => {
                if (!dataTypes.isDefined(element)) {throw {statusCode: 400, message: "Required element not defined"};
                }
            });

            await this.db.submitQuery(query, params)
            await this.db.close()
            return {statusCode: 200, message: 'User created successfully'}
        } 
        catch (e) {
            if (dataTypes.isDict(e)){
                return e
            } else {
                return {statusCode: 500, message: 'Unknown serverSide error'}
            }
        }
    }
}

module.exports = User