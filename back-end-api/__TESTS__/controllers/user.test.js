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

    })

    afterEach(async () => {
        await d.purgeDatabase()
    })

    afterAll(async () => {
        await d.close()
    })


    it('should create a user with valid input', async () => {
        const input = {username: "someUsernameasdsa", email: "someEmailasdas", passwordHash: "somePasswordHashasdsa"}
        const result = await user.userCreate(input)
    
        expect(result.statusCode).toBe(201)
        expect(result.message).toBe('User created successfully')
    })

    it('should throw error on duplicated input', async () => {
        const input = {username: "someUsernames", email: "someEmails", passwordHash: "somePasswordHashs"}
        const result = await user.userCreate(input)
        const secondResult = await user.userCreate(input)

        expect(result.statusCode).toBe(201)
        expect(result.message).toBe('User created successfully')
        expect(secondResult.statusCode).toBe(400)
        expect(secondResult.message).toBe("Database query error: Duplicate entry 'someEmails' for key 'Users.Email_UNIQUE'")
        
    })

    it('should throw error on invalid input', async () => {
        const input = {username: "someUsername", email: "someEmailf"}
        const result = await user.userCreate(input)

        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Required element not defined")
    })
})

describe('user authentication', () => {
    let d = null
    let user = null

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
        await d.purgeDatabase()
        user = new User(true)
        await user.userCreate({username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash"}) // closes the connection as users are only alive for 1 command
    })

    beforeEach(async () => {

        user = new User(true)
    })

    afterAll(async () => {
        await d.close()
    })

    it('should provide a bearer token on success', async () =>{
        const body = {username: "someUsername", passwordHash: "somePasswordHash"}
        const response = await user.authenticateUser(body)

        expect(response.statusCode).toBe(202)
        expect(response.message).toBe('User authenticated')
        expect(response.token.startsWith('Bearer ey')).toBe(true)
    })  

    it('should throw error if passwordHash doesnt link to account', async () => {
        const body = {username: "someUsername", passwordHash: "someOtherPasswordHash"}
        const response = await user.authenticateUser(body)

        expect(response.statusCode).toBe(401)
        expect(response.message).toBe('User is not authenticated')
    })

    it('should throw error if username doesnt link to account', async () => {
        const body = {username: "someOtherUsername", passwordHash: "somePasswordHash"}
        const response = await user.authenticateUser(body)

        expect(response.statusCode).toBe(404)
        expect(response.message).toBe('No objects found')
    })

    it('should throw error on malformed data', async () => {
        const body = {passwordHash: "somePasswordHash"}
        const response = await user.authenticateUser(body)

        expect(response.statusCode).toBe(400)
        expect(response.message).toBe('Invalid parameters')
    })
})

describe('gathering user details', () => {
    let d = null
    let user = null

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
        await d.purgeDatabase()
        user = new User(true)
        await user.userCreate({username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash"}) // closes the connection as users are only alive for 1 command

    })

    beforeEach(async () => {
        user = new User(true)

    })

    afterAll(async () => {
        await d.close()
    })


    it('should return username + score from valid ID', async () => {
        const response = await user.getUserDetails(1)

        expect(response.statusCode).toBe(200)
        expect(response.message).toBe('User data gathered')
        expect(response.data.username).toBe('someUsername')
        expect(response.data.score).toBeNull()
        expect(response.data.tripCount).toBe(0)
    })

    it('should return error on a user that doesnt exist', async () => {
        const response = await user.getUserDetails(-1)

        expect(response.statusCode).toBe(400)
        expect(response.message).toBe('Invalid userID')
    })

    it('should return error on malformed data', async () => {
        const response = await user.getUserDetails("xxx")
        
        expect(response.statusCode).toBe(400)
        expect(response.message).toBe('Invalid userID')
    })
})

describe('updating user details', () => {
    let d = null
    let user = null

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()


    })

    beforeEach(async () => {
        await d.purgeDatabase()

        user = new User(true)
        await user.userCreate({username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash"}) // closes the connection as users are only alive for 1 command
        user = new User(true)
    })

    afterAll(async () => {
        await d.close()
    })


    it('should allow updating the email', async () => {
        const updateResponse = await user.updateUserDetails({email: "someNewEmail"}, 1)
        
        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.message).toBe('User updated')

        const response = await d.fetchQuery(`SELECT email FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].email).toBe("someNewEmail")
    })

    it('should allow updating the username', async () => {
        const updateResponse = await user.updateUserDetails({username: "someNewUsername"}, 1)
        
        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.message).toBe('User updated')

        const response = await d.fetchQuery(`SELECT username FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].username).toBe("someNewUsername")
    })

    it('should allow updating the passwordHash', async () => {
        const updateResponse = await user.updateUserDetails({passwordHash: "someNewPasswordHash"}, 1)
        
        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.message).toBe('User updated')

        const response = await d.fetchQuery(`SELECT passwordHash FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].passwordHash).toBe("someNewPasswordHash")
    })

    it('should allow updating 2 items', async () => {
        const updateResponse = await user.updateUserDetails({passwordHash: "someNewPasswordHash", username: "someNewUsername"}, 1)
        
        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.message).toBe('User updated')

        const response = await d.fetchQuery(`SELECT passwordHash, username FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].passwordHash).toBe("someNewPasswordHash")
        expect(response[0].username).toBe("someNewUsername")

    })

    it('should allow updating 3 items', async () => {
        const updateResponse = await user.updateUserDetails({passwordHash: "someNewPasswordHash", username: "someNewUsername", email: "someNewEmail"}, 1)
        
        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.message).toBe('User updated')

        const response = await d.fetchQuery(`SELECT passwordHash, username, email FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].passwordHash).toBe("someNewPasswordHash")
        expect(response[0].username).toBe("someNewUsername")
        expect(response[0].email).toBe("someNewEmail")

    })

    it('should deny when updating a non-existant', async () => {
        const updateResponse = await user.updateUserDetails({somethingMadeUp: "somethingMadeUP"}, 1)
        
        expect(updateResponse.statusCode).toBe(404)
        expect(updateResponse.message).toBe("No objects found")
    })

    it('should deny on malformed data', async () => {
        const updateResponse = await user.updateUserDetails({}, 1)
        
        expect(updateResponse.statusCode).toBe(400)
        expect(updateResponse.message).toBe("Invalid parameters")
    })

    it('should deny if user doesnt exist', async () => {
        const updateResponse = await user.updateUserDetails({passwordHash: "someNewPasswordHash"}, 50)
        
        expect(updateResponse.statusCode).toBe(404)
        expect(updateResponse.message).toBe("No rows updated")
    })
})