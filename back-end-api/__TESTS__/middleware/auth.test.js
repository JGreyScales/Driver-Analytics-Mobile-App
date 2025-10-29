const JWT_AUTH = require("../../middleware/auth")
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv")

describe('Creating a token', () => {
    it('should create a valid token when provided a userId', () => {
        const userID = 43;
        const currentEpochSeconds = Math.floor(Date.now() / 1000)
        const expireyEpochSeconds = currentEpochSeconds + 3600 // 1 hour into future

        const token = JWT_AUTH.generateToken(userID)
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
           expect(payload.userID).toBe(userID)
           expect(payload.iat).toBeCloseTo(currentEpochSeconds, -1)
           expect(payload.exp).toBeCloseTo(expireyEpochSeconds, -1)
        })
    })

    it('should deny creation if an invalid userID is provided', () => {
        const userID = 0;

        expect(JWT_AUTH.generateToken(userID)).toBe("")
    })

    it('should deny creation if an invalid datatype is provided', () => {
        const userID = undefined;

        expect(JWT_AUTH.generateToken(userID)).toBe("")
    })
})

describe('Authenticating a token', () => {
    beforeEach(() => {
        jest.resetModules(); // clear cached modules
        process.env = {}; // clear cached variables
        dotenv.config({ quiet: true });
    })
    
    it('should resolve true on tokens created from the same secret', async () =>{
        const userID = 25;

        const token = `Bearer ${JWT_AUTH.generateToken(userID)}`
        await expect(JWT_AUTH.authenticateToken(token)).resolves.toBeTruthy()
    })

    it('should reject if a valid key is not formatted correctly', async () => {
        const userID = 25;

        const token = JWT_AUTH.generateToken(userID)
        await expect(JWT_AUTH.authenticateToken(token)).rejects.toBeFalsy()      
    })

    it('should resolve false on tokens generated from a different secret', async () => {
        const userID = 25;

        const token = `Bearer ${JWT_AUTH.generateToken(userID)}`
        process.env.JWT_SECRET = "aDifferentKeyFromCreationKey"

        await expect(JWT_AUTH.authenticateToken(token)).rejects.toBeFalsy()  
    })
    
    it('should resolve false on all other values', async () => {
        const token = undefined
        await expect(JWT_AUTH.authenticateToken(token)).rejects.toBeFalsy()  
    })
})

describe('Retrieving userID from a token', () => {
    beforeEach(() => {
        jest.resetModules(); // clear cached modules
        process.env = {}; // clear cached variables
        dotenv.config({ quiet: true });
    })

    it('should resolve with an INT of the userID', async () => {
        const userID = 24
        const token = `Bearer ${JWT_AUTH.generateToken(userID)}`
        await expect(JWT_AUTH.getUserIDFromToken(token)).resolves.toBe(userID)
    })

    it('should reject with an INT of 0 if userID is not present in the token', async () => {
        const userID = -1
        const token = `Bearer ${JWT_AUTH.generateToken(userID)}`
        await expect(JWT_AUTH.getUserIDFromToken(token)).rejects.toBe(0)
    })

    it('should reject with INT of 0 if the token cannot be decrypted', async () => {
        const userID = 24
        const token = `Bearer ${JWT_AUTH.generateToken(userID)}`
        process.env.JWT_SECRET = "aDifferentKeyFromCreationKey"

        await expect(JWT_AUTH.getUserIDFromToken(token)).rejects.toBe(0)

    })
})