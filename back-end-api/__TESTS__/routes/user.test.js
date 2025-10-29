const request = require('supertest');
const express = require('express');
const user = require("../../routes/user");
const Database = require("../../models/db")
const JWT_AUTH = require("../../middleware/auth")

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
        const query = `TRUNCATE  TABLE ${d.usersTable}`
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

    beforeAll(async () => {
        d = new Database(true);
        await d.connect();
    })

    beforeEach(async () => {
        await d.dropSafety();
        const query = `TRUNCATE  TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();
    })

    afterAll(async () => {
        await d.close()
    })


    it('should delete the requested user', async () => {
        const body = {testing:true};
        await request(app).put('/user').send(body).set('Accept', 'application/json');
        const res = await request(app).delete('/user').send(body).set('Authorization', `bearer ${JWT_AUTH.generateToken(1)}`).set('Accept', 'application/json');

        expect(res.statusCode).toBe(200);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.message).toBe('User created successfully');

       
    })

    it('should throw on non-existing users', async () => {

    })

    it('should deny malformed requests', async () => {
        
    })
})