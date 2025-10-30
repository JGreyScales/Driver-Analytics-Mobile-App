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

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.usersTable} WHERE userID = ? LIMIT 1`, [userID])
        expect(actualResults[0].score).toBe(10)
        expect(actualResults[0].tripCount).toBe(11)
    })
})