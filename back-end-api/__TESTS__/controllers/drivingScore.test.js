const Database = require("../../models/db")
const Driving_Score = require("../../controllers/drivingScore")
const User = require("../../controllers/user")


describe('upload new driving score', () => {
    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
    })

    beforeEach(async () => {
        await d.dropSafety();
        const query = `TRUNCATE TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();

        const user = new User(true)
        await user.userCreate({username: "someUsessdrnameasdsa", email: "someEsamailasdas", passwordHash: "somePasswoasrdHashasdsa"})
        
    })

    afterAll(async () => {
        await d.close()
    })

    it('should allow uploading to a fresh user', async () => {       
        const tripDuration = 60
        const incidentCount = 4
        const averageSpeed = 50
        const maxSpeed = 80
        const userID = 1

        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(200)
        expect(result.message).toBe('User updated')

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.usersTable} WHERE userID = ? LIMIT 1`, [userID])
        expect(actualResults[0].score).toBe(114)
        expect(actualResults[0].tripCount).toBe(1)
    })

    it('should allow uploading to a user with at least 1 score pre-existing', async () => {
        
        const tripDuration = 60
        const incidentCount = 4
        const averageSpeed = 50
        const maxSpeed = 80
        const userID = 1


        const tripDuration2 = 90
        const incidentCount2 = 2
        const averageSpeed2 = 43
        const maxSpeed2 = 55

        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(200)
        expect(result.message).toBe('User updated')

        const result2 = await DS.uploadNewDrivingScore(tripDuration2, incidentCount2, averageSpeed2, maxSpeed2, userID)
        expect(result2.statusCode).toBe(200)
        expect(result2.message).toBe('User updated')

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.usersTable} WHERE userID = ? LIMIT 1`, [userID])
        expect(actualResults[0].score).toBe(127)
        expect(actualResults[0].tripCount).toBe(2)
    })

    // this specific test case can take 14-30 seconds to complete on average
    it('should allow uploading to a user with at least 10 scores pre-existing', async () => {
        const tripDuration = 10
        const incidentCount = 0
        const averageSpeed = 110
        const maxSpeed = 140
        const userID = 1
        const DS = new Driving_Score(true)

        for (let index = 0; index < 100; index = index + 10) {
            let result = await DS.uploadNewDrivingScore(tripDuration + index, incidentCount + (index/10), averageSpeed - index, maxSpeed - index, userID)
            expect(result.statusCode).toBe(200)
            expect(result.message).toBe('User updated')
        }

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.usersTable} WHERE userID = ? LIMIT 1`, [userID])
        expect(actualResults[0].score).toBe(110) // the final score of the sum of these 10 trips averaged
        expect(actualResults[0].tripCount).toBe(10)

    }, 30000) // allow up to 30 seconds to execute instead of 5

    it('should deny on invalid tripDuration', async () => { 
        const tripDuration = -2
        const incidentCount = 4
        const averageSpeed = 50
        const maxSpeed = 80
        const userID = 1
        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Invalid parameters")


    })

    it('should deny on invalid incidentCount', async () => { 
        const tripDuration = 60
        const incidentCount = "dfds"
        const averageSpeed = 50
        const maxSpeed = 80
        const userID = 1
        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Invalid parameters")
    })

    it('should deny on invalid averageSpeed', async () => { 
        const tripDuration = 60
        const incidentCount = 4
        const averageSpeed = -123
        const maxSpeed = 80
        const userID = 1
        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Invalid parameters")
    })

    it('should deny on invalid maxSpeed', async () => { 
        const tripDuration = 60
        const incidentCount = 4
        const averageSpeed = 50
        const maxSpeed = 30
        const userID = 1
        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Invalid parameters")
    })

    it('should deny on invalid userID', async () => { 
        const tripDuration = 60
        const incidentCount = 4
        const averageSpeed = 50
        const maxSpeed = 80
        const userID = 0
        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Invalid parameters")
    })

    it('should handle tripCount corruption', async () => {
        const tripDuration = 60
        const incidentCount = 4
        const averageSpeed = 50
        const maxSpeed = 80
        const userID = 1
        const userObj = new User(true)
        const updateResponse = await userObj.updateUserDetails({tripCount: null}, userID)
        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.message).toBe("User updated")

        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(200)
        expect(result.message).toBe("User updated")

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.usersTable} WHERE userID = ? LIMIT 1`, [userID])
        expect(actualResults[0].score).toBe(114)
        expect(actualResults[0].tripCount).toBe(1)
    })

    it('should handle score corruption', async () => {
        const tripDuration = 60
        const incidentCount = 4
        const averageSpeed = 50
        const maxSpeed = 80
        const userID = 1
        const userObj = new User(true)
        const updateResponse = await userObj.updateUserDetails({score: null, tripCount: 10}, userID)
        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.message).toBe("User updated")

        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(200)
        expect(result.message).toBe("User updated")

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.userScoreTable} WHERE userID = ? LIMIT 1`, [userID])
        expect(actualResults[0].score).toBe(10)
        expect(actualResults[0].tripCount).toBe(11)
    })
})


describe('getting comparative score', () => {
    let d = null

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
    })

    beforeEach(async () => {
        await d.dropSafety();
        const query = `TRUNCATE TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();

        let user = new User(true)
        await user.userCreate({username: "someUsessdrnameasdsa", email: "23432", passwordHash: "somePasswoasrdHashasdsa"})
        user = new User(true)
        await user.userCreate({username: "fgdgd", email: "342", passwordHash: "asdad"})
        user = new User(true)
        await user.userCreate({username: "dfgd", email: "2342", passwordHash: "werwe"})
    })

    afterAll(async () => {
        await d.close()
    })
    
    it('should calculate comparative score between 3+ users', async () => {
        let user = new User(true)
        await user.updateUserDetails({score: 100}, 1)
        user = new User(true)
        await user.updateUserDetails({score: 150}, 2)
        user = new User(true)
        await user.updateUserDetails({score: 50}, 3)

        const DS = new Driving_Score(true)
        const res = await DS.getComparativeScore(1)
        expect(res.statusCode).toBe(200)
        expect(res.message).toBe('comparativeScore computed')
        expect(res.data.comparativeScore).toBe(50)
    })

    it('should calculate comparative score between 2 users', async () => {
        let user = new User(true)
        await user.updateUserDetails({score: 100}, 1)
        user = new User(true)
        await user.updateUserDetails({score: 150}, 2)

        const DS = new Driving_Score(true)
        const res = await DS.getComparativeScore(1)
        expect(res.statusCode).toBe(200)
        expect(res.message).toBe('comparativeScore computed')
        expect(res.data.comparativeScore).toBe(0)
    })

    it('should calculate comparative score between 1 user', async () => {
        let user = new User(true)
        await user.updateUserDetails({score: 100}, 1)

        const DS = new Driving_Score(true)
        const res = await DS.getComparativeScore(1)
        expect(res.statusCode).toBe(200)
        expect(res.message).toBe('No other scores to compare to')
        expect(res.data.comparativeScore).toBe(100)
    })

    it('should reject an invalid userID', async () => {
        let user = new User(true)
        await user.updateUserDetails({score: 100}, 1)

        const DS = new Driving_Score(true)
        const res = await DS.getComparativeScore(-1)
        expect(res.statusCode).toBe(400)
        expect(res.message).toBe("Invalid userID")
    })

    it('should reject if user doesnt exist', async () => {
        const DS = new Driving_Score(true)
        const res = await DS.getComparativeScore(500)
        expect(res.statusCode).toBe(404)
        expect(res.message).toBe("No objects found")
    })

    it('should reject if no scores are in system', async() => {
        const DS = new Driving_Score(true)
        const res = await DS.getComparativeScore(1)
        expect(res.statusCode).toBe(500)
        expect(res.message).toBe("Not all values could be gathered")
    })
})

describe('getting historical trip data', () => {
    let d = null

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
    })

    afterAll(async () => {
        await d.close()
    })

    beforeEach(async () => {
        await d.dropSafety();
        const query = `TRUNCATE TABLE ${d.usersTable}`
        await d.submitQuery(query, [], true)
        await d.raiseSafety();

        let user = new User(true)
        await user.userCreate({username: "somedsfUsessdrna", email: "234df32", passwordHash: "soasdmePasswoasrsdsa"})
    })

    it('should return 5 results at a time', () => {

    })

    it ('should allow offsetting to retrieve 10 results at a time', () => {

    })

    it('should return nothing if there is no trips', () => {

    })

    it('should deny if invalid userID', () => {

    })

    it('should deny if invalid offset', () => {
        
    })


})