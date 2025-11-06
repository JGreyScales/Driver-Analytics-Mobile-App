const {genericValidation, validateFields} = require("./generic")

async function validateGetScore(req, res, next) {
    try {
        await genericValidation(req);

        const ALLOWED_FIELDS = [];
        await validateFields(req, ALLOWED_FIELDS);

        next();
    } catch (err) {
        res.status(err.statusCode).send(err);
    }
}

async function validatePutScore(req, res, next) {
    try{
        await genericValidation(req);

        const ALLOWED_FIELDS = ["tripDuration", "incidentCount", "averageSpeed", "maxSpeed"]
        await validateFields(req, ALLOWED_FIELDS, true)

        next()
    } catch (err){
        res.status(err.statusCode).send(err)
    }
}

module.exports = { validateGetScore, validatePutScore };
