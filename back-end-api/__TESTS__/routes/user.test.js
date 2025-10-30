const request = require('supertest');
const express = require('express');
const user = require("../../routes/user");
const Database = require("../../models/db")
const JWT_AUTH = require("../../middleware/auth")
const User = require("../../controllers/user")

const app = express();
app.use(express.json());
app.use('/user', user);

describe('PUT /user', () => {
    d = null

    beforeAll(async () => {
        d = new Database(true);
        await d.connect();
    })

    beforeEach(async () => {
        await d.dropSafety();
        const query = `TRUNCATE TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
    })

    afterAll(async () => {
        await d.close()
    })

    it('should allow users to be created', async () => {
        const body = {username: "someUsernameddd", email: "someEmaildddd", passwordHash: "somePasswordHashddd", testing:true};
        const res = await request(app).put('/user').send(body).set('Accept', 'application/json');

        expect(res.statusCode).toBe(201);
        expect(res.body.statusCode).toBe(201);
        expect(res.body.message).toBe('User created successfully');
    })

    it('should deny duplicated users', async () => {
        const body = {username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash", testing:true};
        const res1 = await request(app).put('/user').send(body).set('Accept', 'application/json');
        const res2 = await request(app).put('/user').send(body).set('Accept', 'application/json');

        expect(res1.statusCode).toBe(201);
        expect(res1.body.statusCode).toBe(201);
        expect(res1.body.message).toBe('User created successfully');

        expect(res2.statusCode).toBe(400);
        expect(res2.body.statusCode).toBe(400);
        expect(res2.body.message).toBe("Database query error: Duplicate entry 'someEmail' for key 'Users.Email_UNIQUE'");
    })

    it('should deny malformed requests', async () => {
        const res = await request(app).put('/user').set('Accept', 'application/json')

        expect(res.statusCode).toBe(500)
        expect(res.body.statusCode).toBe(500)
        expect(res.body.message).toBe('Unknown serverside error')
    })
});


describe('DELETE /user', () => {
    d = null

    beforeEach(async () => {
        d = new Database(true);
        await d.connect();
        await d.dropSafety();
        await d.submitQuery(`TRUNCATE TABLE ${d.usersTable}`, [], true);
        await d.raiseSafety();
    });
    

    afterEach(async () => {
        await d.close()
    })


    it('should delete the requested user', async () => {
        await d.submitQuery(
            `INSERT INTO ${d.usersTable} (userID, username, email, passwordHash) VALUES (1, "xx", "yy", "tt")`,
            []
        );
        const token = `Bearer ${JWT_AUTH.generateToken(1)}`
        const res = await request(app).delete('/user').send({testing:true}).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('User successfully deleted with ID:1');

       
    })

    it('should throw on non-existing users', async () => {
        const token = `Bearer ${JWT_AUTH.generateToken(1)}`
        const res = await request(app).delete('/user').send({testing:true}).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(404);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBe('No rows updated');
    })

    it('should deny malformed requests', async () => {
        const res = await request(app).delete('/user').send({testing:true}).set('Accept', 'application/json');

        expect(res.statusCode).toBe(400);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toBe('No token attached');
    })
})

describe('POST /user', () => {
    let d = null
    let user = null

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
        await d.dropSafety();
        const query = `TRUNCATE TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
        user = new User(true)
        await user.userCreate({username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash"})
    })

    afterAll(async () => {
        await d.close()
    })

    it('should provide a bearer token on success', async () =>{
        const body = {username: "someUsername", passwordHash: "somePasswordHash", testing:true}
        const res = await request(app).post('/user').send(body).set('Accept', 'application/json');

        expect(res.statusCode).toBe(202)
        expect(res.body.statusCode).toBe(202)
        expect(res.body.message).toBe('User authenticated')
        expect(res.body.token.startsWith('Bearer ey')).toBe(true)
    })  

    it('should throw error if passwordHash doesnt link to account', async () => {
        const body = {username: "someUsername", passwordHash: "someOtherPasswordHash", testing:true}
        const res = await request(app).post('/user').send(body).set('Accept', 'application/json');

        expect(res.statusCode).toBe(404)
        expect(res.body.statusCode).toBe(404)
        expect(res.body.message).toBe('No objects found')
    })

    it('should throw error if username doesnt link to account', async () => {
        const body = {username: "someOtherUsername", passwordHash: "somePasswordHash", testing:true}
        const res = await request(app).post('/user').send(body).set('Accept', 'application/json');

        expect(res.statusCode).toBe(404)
        expect(res.body.statusCode).toBe(404)
        expect(res.body.message).toBe('No objects found')
    })

    it('should throw error on malformed data', async () => {
        const body = {passwordHash: "somePasswordHash", testing:true}
        const res = await request(app).post('/user').send(body).set('Accept', 'application/json');

        expect(res.statusCode).toBe(400)
        expect(res.body.statusCode).toBe(400)
        expect(res.body.message).toBe('Invalid parameters')
    })
})

describe('GET /user', () => {
    let d = null
    let user = null

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
        await d.dropSafety();
        const query = `TRUNCATE TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
        user = new User(true)
        await user.userCreate({username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash"})
    })

    afterAll(async () => {
        await d.close()
    })

    it('should provide user details if JWT token is valid', async () =>{
        const body = {testing:true}
        const token = `Bearer ${JWT_AUTH.generateToken(1)}`
        const res = await request(app).get('/user').send(body).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(200)
        expect(res.body.statusCode).toBe(200)
        expect(res.body.message).toBe('User data gathered')
        expect(res.body.data.username).toBe('someUsername')
        expect(res.body.data.score).toBeNull()
    })  

    it('should deny if JWT is invalid', async () => {
        const body = {testing:true}
        const token = `Bearer ${JWT_AUTH.generateToken(1)}2`
        const res = await request(app).get('/user').send(body).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(400)
        expect(res.body.statusCode).toBe(400)
        expect(res.body.message).toBe('No token attached')
    })

    it('should deny if JWT is not present', async () => {
        const body = {testing:true}
        const res = await request(app).get('/user').send(body).set('Accept', 'application/json');

        expect(res.statusCode).toBe(400)
        expect(res.body.statusCode).toBe(400)
        expect(res.body.message).toBe('No token attached')
    })
})

describe('PATCH /user', () => {
    let d = null
    let user = null
    let token = `Bearer ${JWT_AUTH.generateToken(1)}`

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
        
    })

    beforeEach(async () => {
        await d.dropSafety();
        const query = `TRUNCATE TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
        user = new User(true)
        await user.userCreate({username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash"})

        await new Promise(r => setTimeout(r, 20));
    })

    afterAll(async () => {
        await d.close()
    })

    it('should allow updating the email', async () => {
        const body = {email: "someNewEmail", testing: true}
        const res = await request(app).patch("/user").send(body).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(200)
        expect(res.body.statusCode).toBe(200)
        expect(res.body.message).toBe('User updated')

        const response = await d.fetchQuery(`SELECT email FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].email).toBe("someNewEmail")
    })

    it('should allow updating the username', async () => {
        const body = {username: "someNewUsername", testing: true}
        const res = await request(app).patch("/user").send(body).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(200)
        expect(res.body.statusCode).toBe(200)
        expect(res.body.message).toBe('User updated')
        
        const response = await d.fetchQuery(`SELECT username FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].username).toBe("someNewUsername")
    })

    it('should allow updating the passwordHash', async () => {
        const body = {passwordHash: "someNewPasswordHash", testing: true}
        const res = await request(app).patch("/user").send(body).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(200)
        expect(res.body.statusCode).toBe(200)
        expect(res.body.message).toBe('User updated')
        
        const response = await d.fetchQuery(`SELECT passwordHash FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].passwordHash).toBe("someNewPasswordHash")
    })

    it('should allow updating 2 items', async () => {
        const body = {passwordHash: "someNewPasswordHash", username: "someNewUsername", testing: true}
        const res = await request(app).patch("/user").send(body).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(200)
        expect(res.body.statusCode).toBe(200)
        expect(res.body.message).toBe('User updated')
        
        const response = await d.fetchQuery(`SELECT passwordHash, username FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].passwordHash).toBe("someNewPasswordHash")
        expect(response[0].username).toBe('someNewUsername')
    })

    it('should allow updating 3 items', async () => {
        const body = {passwordHash: "someNewPasswordHash", username: "someNewUsername", email: "someNewEmail", testing: true}
        const res = await request(app).patch("/user").send(body).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(200)
        expect(res.body.statusCode).toBe(200)
        expect(res.body.message).toBe('User updated')
        
        const response = await d.fetchQuery(`SELECT passwordHash, username, email FROM ${d.usersTable} WHERE userID = 1 LIMIT 1`)
        expect(response[0].passwordHash).toBe("someNewPasswordHash")
        expect(response[0].username).toBe('someNewUsername')
        expect(response[0].email).toBe('someNewEmail')
    })

    it('should deny when updating a non-existant', async () => {
        const body = {someField:"someValue", testing: true}
        const res = await request(app).patch("/user").send(body).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(400)
        expect(res.body.statusCode).toBe(400)
        expect(res.body.message).toBe("Database query error: Unknown column 'someField' in 'field list'")
    })

    it('should deny on malformed data', async () => {
        const res = await request(app).patch("/user").send({}).set('Authorization', token).set('Accept', 'application/json');

        expect(res.statusCode).toBe(400)
        expect(res.body.statusCode).toBe(400)
        expect(res.body.message).toBe("Invalid parameters")
    })

    it('should deny if no token is attached', async () => {
        const body = {email: "someNewEmail", testing: true}
        const res = await request(app).patch("/user").send(body).set('Accept', 'application/json');

        expect(res.statusCode).toBe(400)
        expect(res.body.statusCode).toBe(400)
        expect(res.body.message).toBe('No token attached')
    })

    it('should deny if invalid userID is attached', async () => {
        const body = {email: "someNewEmail", testing: true}
        const res = await request(app).patch("/user").send(body).set('Authorization', `Bearer ${JWT_AUTH.generateToken(500)}`).set('Accept', 'application/json');

        expect(res.statusCode).toBe(404)
        expect(res.body.statusCode).toBe(404)
        expect(res.body.message).toBe("No rows updated")
    })
})