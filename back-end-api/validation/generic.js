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

async function validateFields(req, FIELDS, allRequired = false) {
    const ALLOWED_FIELDS = [...FIELDS, 'testing'] // always allow a testing paramater to pass through
    const body = req.body || {};
  
    // Check for disallowed fields
    for (const key of Object.keys(body)) {
      if (!ALLOWED_FIELDS.includes(key)) {
        throw { statusCode: 400, message: `${key} is not a valid field for this request` };
      }
    }
  
    // If all fields are required, check presence of each allowed field
    if (allRequired) {
      const missing = FIELDS.filter(field => !(field in body));
      if (missing.length > 0) {
        throw { statusCode: 400, message: `Missing required fields: ${missing.join(', ')}` };
      }
    }
  
    return true;
  }
  


module.exports = { genericValidation, validateFields }