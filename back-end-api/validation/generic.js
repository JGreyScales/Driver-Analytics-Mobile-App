const JWT_AUTH = require("../middleware/auth")

async function genericValidation(req) {
    return new Promise(async (resolve, reject) => {
        try {
            const isAuthenticated = await JWT_AUTH.authenticateToken(req)
            if (!isAuthenticated) {
                return reject({statusCode: 401, message:'No token attached'})
            }
            return resolve(true)
        } catch (error) {
            return reject({statusCode: 401, message:'No token attached'})
        }
    })
}

async function validateFields(req, ALLOWED_FIELDS) {
    return new Promise((resolve, reject) => {
        if (req.body) {
            Object.keys(req.body).forEach((key) => {
                if (!ALLOWED_FIELDS.includes(key)) {
                    return reject({statusCode: 400, message:`${key} is not a valid field for this request`})
                }
            })
        }
        return resolve(true)
    })
}


module.exports = { genericValidation, validateFields }