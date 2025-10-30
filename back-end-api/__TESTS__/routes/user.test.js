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
        const body = {username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash", testing:true};
        const res = await request(app).put('/user').send(body).set('Accept', 'application/json');
        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('User created successfully');
    })

    it('should deny duplicated users', async () => {
        const body = {username: "someUsername", email: "someEmail", passwordHash: "somePasswordHash", testing:true};
        const res1 = await request(app).put('/user').send(body).set('Accept', 'application/json');
        const res2 = await request(app).put('/user').send(body).set('Accept', 'application/json');

        expect(res1.statusCode).toBe(200);
        expect(res1.body.statusCode).toBe(200);
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

    
        // Optional: tiny delay to ensure MySQL fully commits before test
        await new Promise(r => setTimeout(r, 20));
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