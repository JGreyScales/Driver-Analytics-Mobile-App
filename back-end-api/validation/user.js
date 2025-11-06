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

module.exports = { validateGetUser };
