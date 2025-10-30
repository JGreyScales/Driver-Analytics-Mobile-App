const request = require('supertest');
const express = require('express');
const driving = require("../../routes/drivingScore");
const JWT_AUTH = require("../../middleware/auth")
const Database = require("../../models/db")
const User = require("../../controllers/user")

const app = express();
app.use(express.json());
app.use('/driving', driving);

describe('PUT /driving', () => {
  d = null
  token = null

  beforeAll(async () => {
    d = new Database(true);
    await d.connect();
    token = `Bearer ${JWT_AUTH.generateToken(1)}`
  })

  beforeEach(async () => {
    await d.dropSafety();
    const query = `TRUNCATE TABLE ${d.usersTable}`
    await d.submitQuery(query, [], true)
    await d.raiseSafety();
    user = new User(true)
    await user.userCreate({ username: "somessUsername", email: "somaeEmail", passwordHash: "somePasqwswordHash" })
  })

  afterAll(async () => {
    await d.close()
  })


  it('should allow the submission of a new drivingSession', async () => {
    const body = { tripDuration: 90, incidentCount: 2, averageSpeed: 70, maxSpeed: 90, testing: true }
    const res = await request(app).put("/driving/score").send(body).set('Authorization', token).set('Accept', 'application/json')
    expect(res.statusCode).toBe(200)
    expect(res.body.statusCode).toBe(200)
    expect(res.body.message).toBe('User updated')
  })

  it('should allow the submission of two logs back-to-back', async () => {
    const body = { tripDuration: 90, incidentCount: 2, averageSpeed: 70, maxSpeed: 90, testing: true }
    const res = await request(app).put("/driving/score").send(body).set('Authorization', token).set('Accept', 'application/json')
    expect(res.statusCode).toBe(200)
    expect(res.body.statusCode).toBe(200)
    expect(res.body.message).toBe('User updated')

    const res2 = await request(app).put("/driving/score").send(body).set('Authorization', token).set('Accept', 'application/json')
    expect(res2.statusCode).toBe(200)
    expect(res2.body.statusCode).toBe(200)
    expect(res2.body.message).toBe('User updated')
  })

  it('should deny on no body', async () => {
    const res = await request(app).put("/driving/score").set('Authorization', token).set('Accept', 'application/json')
    expect(res.statusCode).toBe(400)
    expect(res.body.statusCode).toBe(400)
    expect(res.body.message).toBe('No body attached')
  })

  it('should deny on no token', async () => {
    const body = { tripDuration: 90, incidentCount: 2, averageSpeed: 70, maxSpeed: 90, testing: true }
    const res = await request(app).put("/driving/score").send(body).set('Accept', 'application/json')
    expect(res.statusCode).toBe(400)
    expect(res.body.statusCode).toBe(400)
    expect(res.body.message).toBe('No token attached')
  })

  it('should deny on invalid tripDuration', async () => {
    const body = { tripDuration: -1, incidentCount: 2, averageSpeed: 70, maxSpeed: 90, testing: true }
    const res = await request(app).put("/driving/score").send(body).set('Authorization', token).set('Accept', 'application/json')
    expect(res.statusCode).toBe(400)
    expect(res.body.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid body')
  })

  it('should deny on invalid incidentCount', async () => {
    const body = { tripDuration: 90, incidentCount: "xxsd", averageSpeed: 70, maxSpeed: 90, testing: true }
    const res = await request(app).put("/driving/score").send(body).set('Authorization', token).set('Accept', 'application/json')
    expect(res.statusCode).toBe(400)
    expect(res.body.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid body')
  })

  it('should deny on invalid averageSpeed', async () => {
    const body = { tripDuration: 90, incidentCount: 2, maxSpeed: 90, testing: true }
    const res = await request(app).put("/driving/score").send(body).set('Authorization', token).set('Accept', 'application/json')
    expect(res.statusCode).toBe(400)
    expect(res.body.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid body')
  })

  it('should deny if max speed is less than average speed', async () => {
    const body = { tripDuration: 90, incidentCount: 2, averageSpeed: 70, maxSpeed: 69, testing: true }
    const res = await request(app).put("/driving/score").send(body).set('Authorization', token).set('Accept', 'application/json')
    expect(res.statusCode).toBe(400)
    expect(res.body.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid body')
  })

  it('should deny on invalid max speed', async () => {
    const body = { tripDuration: 90, incidentCount: 2, averageSpeed: 70, maxSpeed: -4, testing: true }
    const res = await request(app).put("/driving/score").send(body).set('Authorization', token).set('Accept', 'application/json')
    expect(res.statusCode).toBe(400)
    expect(res.body.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid body')
  })
});

describe('GET /comparativeScore', () => {
  let d = null
  let token = null


  beforeAll(async () => {
    d = new Database(true)
    await d.connect()
    token = `Bearer ${JWT_AUTH.generateToken(1)}`
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

  it('should return my comparativeScore', async () => {

    let user = new User(true)
    await user.userCreate({ username: "someUsessdrnameasdsa", email: "23432", passwordHash: "somePasswoasrdHashasdsa" })
    user = new User(true)
    await user.updateUserDetails({ score: 100 }, 1)
    user = new User(true)
    await user.userCreate({ username: "fgdgd", email: "342", passwordHash: "asdad" })
    user = new User(true)
    await user.updateUserDetails({ score: 150 }, 2)
    user = new User(true)
    await user.userCreate({ username: "dfgd", email: "2342", passwordHash: "werwe" })
    user = new User(true)
    await user.updateUserDetails({ score: 50 }, 3)
    
    const body = {testing:true}
    const res = await request(app).get("/driving/comparativeScore").send(body).set('Authorization', token).set('Accept', 'application/json')
    expect(res.statusCode).toBe(200)
    expect(res.body.statusCode).toBe(200)
    expect(res.body.message).toBe('comparativeScore computed')
    expect(res.body.data.comparativeScore).toBe(50)
  })

  it('should deny if no token', async () => {
    const body = {testing:true}
    const res = await request(app).get("/driving/comparativeScore").send(body).set('Accept', 'application/json')
    expect(res.statusCode).toBe(400)
    expect(res.body.statusCode).toBe(400)
    expect(res.body.message).toBe('No token attached')
  })
})