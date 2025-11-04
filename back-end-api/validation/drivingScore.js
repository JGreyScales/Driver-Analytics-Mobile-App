const {genericValidation, validateFields} = require("./generic")

async function validateGetScore(req, res, next){
    try {
        await genericValidation(req, res, (err) => {
            const ALLOWED_FIELDS = []
            

            next()
        })
    } catch (error){
        return error
    }
}