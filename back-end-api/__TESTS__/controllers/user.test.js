const User = require("../../controllers/user")
const Database = require("../../models/db")

describe('user object', () => {
    it('should create a database instance on construction', () => {
        const userObj = new User(true)
        expect(userObj.db).toBeDefined()
        expect(userObj.db).toBeInstanceOf(Database);
    })
})

describe('user creation method', () => {
    let user = null
    let d = null

    beforeAll(async () => {
        user = new User(true)
        d = new Database(true)
        await d.connect()
        await d.dropSafety();
        const query = `TRUNCATE  TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
    })

    afterEach(async () => {
        await d.dropSafety();
        const query = `TRUNCATE  TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
    })

    afterAll(async () => {
        await d.close()
    })


    it('should create a user with valid input', async () => {
        const input = {username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash"}
        const result = await user.userCreate(input)

        expect(result.statusCode).toBe(200)
        expect(result.message).toBe('User created successfully')
    })

    it('should throw error on duplicated input', async () => {
        const input = {username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash"}
        const result = await user.userCreate(input)
        const secondResult = await user.userCreate(input)

        console.log(result)
        console.log(secondResult)

        expect(result.statusCode).toBe(200)
        expect(result.message).toBe('User created successfully')
        expect(secondResult.statusCode).toBe(400)
        expect(secondResult.message).toBe("Database query error: Duplicate entry 'someEmail' for key 'Users.Email_UNIQUE'")
        
    })

    it('should throw error on invalid input', async () => {
        const input = {username: "someUsername", email: "someEmail"}
        const result = await user.userCreate(input)

        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Required element not defined")
    })
})