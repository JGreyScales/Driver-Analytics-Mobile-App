const {genericValidation, validateFields} = require("./generic")

async function validateGetScore(req, res, next){
    try {
        await genericValidation(req, res, async (err) => {
            const ALLOWED_FIELDS = []
            await validateFields(req, ALLOWED_FIELDS) // throws on false

            next()
        })
    } catch (error){
        return error
    }
}

module.exports = {validateGetScore}