const {genericValidation, validateFields} = require("../../validation/generic")
const JWT_AUTH = require("../../middleware/auth")


describe('genericValidation', () => {
    it('should allow a valid token to resolve', async () => {
        JWT = `Bearer ${JWT_AUTH.generateToken(1)}`
        req = {}
        req.header = {}
        req.header.Authorization = JWT
        await expect(genericValidation(req)).resolves.toBeTruthy()
    })

    it('should reject an invalid token', async () => {
        JWT = `Bearer ${JWT_AUTH.generateToken(1)}3`
        req = {}
        req.header = {}
        req.header.Authorization = JWT
        await expect(genericValidation(req)).rejects.toStrictEqual({statusCode: 401, message:'No token attached'})
    })

    it('should reject if an auth header is not present', async () => {
        req = {}
        req.header = {}
        await expect(genericValidation(req)).rejects.toStrictEqual({statusCode: 401, message:'No token attached'})
    })
})

describe('validate fields', () => {
    it('should allow fields that are in the allowed list through', async () => {
        ALLOWED_VALUES = ["userID", "password", "username", "tye"]
        req = {}
        req.body = {}
        req.body.userID = 4234
        req.body.password = "pass"
        req.body.username = "user"
        req.body.tye = 3242

        await expect(validateFields(req, ALLOWED_VALUES)).resolves.toBeTruthy()
    })

    it('should deny invalid fields from the list', async () => {
        ALLOWED_VALUES = ["userID", "password", "username"]
        req = {}
        req.body = {}
        req.body.userID = 4234
        req.body.password = "pass"
        req.body.username = "user"
        req.body.tye = 3242

        await expect(validateFields(req, ALLOWED_VALUES)).rejects.toStrictEqual({statusCode: 400, message:`tye is not a valid field for this request`})
    })

    it('should allow empty bodies', async () => {
        ALLOWED_VALUES = []
        req = {}
        req.body = {}

        await expect(validateFields(req, ALLOWED_VALUES)).resolves.toBeTruthy()
    })

    it('should deny if not all fields are met and required is true', async () => {
        ALLOWED_VALUES = ["userID", "password", "username", "tye"]
        req = {}
        req.body = {}
        req.body.userID = 4234
        req.body.password = "pass"
        req.body.tye = 3242

        await expect(validateFields(req, ALLOWED_VALUES, true)).rejects.toStrictEqual({statusCode: 400, message:"Missing required fields: username"})
    })

    it('should allow testing to pass through', async () => {
        ALLOWED_VALUES = ["userID", "password", "username", "tye"]
        req = {}
        req.body = {}
        req.body.userID = 4234
        req.body.password = "pass"
        req.body.username = "user"
        req.body.tye = 3242
        req.body.testing = true

        await expect(validateFields(req, ALLOWED_VALUES)).resolves.toBeTruthy()
    })
})