const {genericValidation, validateFields} = require("./generic")

async function validateGetUser(req, res, next) {
    try {
        await genericValidation(req);

        const ALLOWED_FIELDS = [];
        await validateFields(req, ALLOWED_FIELDS);

        next();
    } catch (err) {
        res.status(err.statusCode).send(err.message);
    }
}

async function validatePutUser(req, res, next) {
    try {
        const ALLOWED_FIELDS = ["username", "email", "passwordHash"] ;
        await validateFields(req, ALLOWED_FIELDS, true);

        next()
    } catch (err) {
        res.status(err.statusCode).send(err.message)    
    }
}

async function validatePostUser(req, res, next) {
    try {
        await genericValidation(req)
        
        const ALLOWED_FIELDS = ['username', 'passwordHash']
        await validateFields(req, ALLOWED_FIELDS, true)

        next()
    } catch (err) {
        res.status(err.statusCode).send(err.message)
    }
}

async function validateDeleteUser(req, res, next) {
    try {
        await genericValidation(req)

        const ALLOWED_FIELDS = []
        await validateFields(req, ALLOWED_FIELDS)

        next()
    } catch (err) {
        res.status(err.statusCode).send(err.message)
    }
}
module.exports = { validateGetUser, validatePutUser, validatePostUser, validateDeleteUser};
