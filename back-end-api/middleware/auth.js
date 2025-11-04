const jwt = require("jsonwebtoken")
const dataType = require('../utils/dataType')
require("dotenv").config({ quiet: true });

class JWT_AUTH {
    constructor() { }

    static __extractToken(req) {
        let token = undefined;
        try {
            if (typeof (req) === 'string') { token = req?.split(' ')[1] }
            else {
                try {
                    token = req.header.Authorization?.split(' ')[1];
                } catch {
                    token = req.header('Authorization')?.split(' ')[1];
                }

            }
        } catch {
            token = ""
        } finally {
            return token
        }
    }

    static generateToken(userID) {
        // empty string on failure

        if (!dataType.isID(userID)) return ""

        return jwt.sign(
            { 'userID': userID },
            process.env.JWT_SECRET,
            { 'expiresIn': '1h' }
        )
    }

    static authenticateToken(req) {
        return new Promise((resolve, reject) => {
            const token = this.__extractToken(req);
            jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) return reject(false);
                if (!dataType.isDefined(payload.userID)) return reject(false)
                return resolve(true)
            })
        })
    }

    static getUserIDFromToken(req) {
        return new Promise((resolve, reject) => {
            const token = this.__extractToken(req);
            jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) return reject(0);
                if (!dataType.isDefined(payload.userID)) reject(0)
                return resolve(payload.userID)
            })
        })
    }

}

module.exports = JWT_AUTH