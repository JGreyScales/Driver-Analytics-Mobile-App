const Database = require("../../models/db")
const Driving_Score = require("../../controllers/drivingScore")
const User = require("../../controllers/user")


describe('upload new driving score', () => {
    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
    })

    beforeEach(async () => {
        await d.purgeDatabase()

        const user = new User(true)
        await user.userCreate({ username: "someUsessdrnameasdsa", email: "someEsamailasdas", passwordHash: "somePasswoasrdHashasdsa" })

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

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.userScoreTable} WHERE userID = ? LIMIT 1`, [userID])
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

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.userScoreTable} WHERE userID = ? LIMIT 1`, [userID])
        expect(actualResults[0].score).toBe(127)
        expect(actualResults[0].tripCount).toBe(2)
    }, 7000)

    // this specific test case can take 14-30 seconds to complete on average
    it('should allow uploading to a user with at least 10 scores pre-existing', async () => {
        const tripDuration = 10
        const incidentCount = 0
        const averageSpeed = 110
        const maxSpeed = 140
        const userID = 1
        const DS = new Driving_Score(true)

        for (let index = 0; index < 100; index = index + 10) {
            let result = await DS.uploadNewDrivingScore(tripDuration + index, incidentCount + (index / 10), averageSpeed - index, maxSpeed - index, userID)
            expect(result.statusCode).toBe(200)
            expect(result.message).toBe('User updated')
        }

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.userScoreTable} WHERE userID = ? LIMIT 1`, [userID])
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
        const updateResponse = await userObj.updateUserDetails({ tripCount: null }, userID)
        expect(updateResponse.statusCode).toBe(400)
        expect(updateResponse.message).toBe("Database query error: Column 'tripCount' cannot be null")

        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(200)
        expect(result.message).toBe("User updated")

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.userScoreTable} WHERE userID = ? LIMIT 1`, [userID])
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
        const updateResponse = await userObj.updateUserDetails({ score: null, tripCount: 10 }, userID)
        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.message).toBe("User updated")

        const DS = new Driving_Score(true)
        const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)
        expect(result.statusCode).toBe(200)
        expect(result.message).toBe("User updated")

        const actualResults = await d.submitQuery(`SELECT score, tripCount FROM ${d.userScoreTable} WHERE userID = ? LIMIT 1`, [userID])
        expect(actualResults[0].score).toBe(10)
        expect(actualResults[0].tripCount).toBe(11)
    }, 7000)
})


describe('getting comparative score', () => {
    let d = null

    beforeAll(async () => {
        d = new Database(true)
        await d.connect()
    })

    beforeEach(async () => {
        await d.purgeDatabase()

        let user = new User(true)
        await user.userCreate({ username: "someUsessdrnameasdsa", email: "23432", passwordHash: "somePasswoasrdHashasdsa" })
        user = new User(true)
        await user.userCreate({ username: "fgdgd", email: "342", passwordHash: "asdad" })
        user = new User(true)
        await user.userCreate({ username: "dfgd", email: "2342", passwordHash: "werwe" })
    }, 15000)

    afterAll(async () => {
        await d.close()
    })

    it('should calculate comparative score between 3+ users', async () => {
        let user = new User(true)
        await user.updateUserDetails({ score: 100 }, 1)
        user = new User(true)
        await user.updateUserDetails({ score: 150 }, 2)
        user = new User(true)
        await user.updateUserDetails({ score: 50 }, 3)

        const DS = new Driving_Score(true)
        const res = await DS.getComparativeScore(1)
        expect(res.statusCode).toBe(200)
        expect(res.message).toBe('comparativeScore computed')
        expect(res.data.comparativeScore).toBe(50)
    })

    it('should calculate comparative score between 2 users', async () => {
        let user = new User(true)
        await user.updateUserDetails({ score: 100 }, 1)
        user = new User(true)
        await user.updateUserDetails({ score: 150 }, 2)

        const DS = new Driving_Score(true)
        const res = await DS.getComparativeScore(1)
        expect(res.statusCode).toBe(200)
        expect(res.message).toBe('comparativeScore computed')
        expect(res.data.comparativeScore).toBe(0)
    })

    it('should calculate comparative score between 1 user', async () => {
        let user = new User(true)
        await user.updateUserDetails({ score: 100 }, 1)

        const DS = new Driving_Score(true)
        const res = await DS.getComparativeScore(1)
        expect(res.statusCode).toBe(200)
        expect(res.message).toBe('No other scores to compare to')
        expect(res.data.comparativeScore).toBe(100)
    })

    it('should reject an invalid userID', async () => {
        let user = new User(true)
        await user.updateUserDetails({ score: 100 }, 1)

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

    it('should reject if no scores are in system', async () => {
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
        await d.purgeDatabase()

        let user = new User(true)
        await user.userCreate({ username: "somedsfUsessdrna", email: "234df32", passwordHash: "soasdmePasswoasrsdsa" })

        let DS = new Driving_Score(true)
        await DS.uploadNewDrivingScore(60, 1, 20, 30, 1)
        await DS.uploadNewDrivingScore(70, 1, 20, 30, 1)
        await DS.uploadNewDrivingScore(80, 1, 20, 30, 1)
        await DS.uploadNewDrivingScore(90, 1, 20, 30, 1)
        await DS.uploadNewDrivingScore(100, 1, 20, 30, 1)
        await DS.uploadNewDrivingScore(110, 1, 20, 30, 1)
        await DS.uploadNewDrivingScore(120, 1, 20, 30, 1)
        await DS.uploadNewDrivingScore(130, 1, 20, 30, 1)
        await DS.uploadNewDrivingScore(140, 1, 20, 30, 1)
    }, 60000)

    afterAll(async () => {
        await d.close()
    })

    it('should return 5 results at a time', async () => {
        const DS = new Driving_Score(true)

        const result = await DS.getDrivingResults(1, 0)

        expect(result.statusCode).toBe(200)
        expect(result.message).toBe('trips fetched with offset 0')

        expect(result.data[0].tripID).toBe(9)
        expect(result.data[0].tripScore).toBe(164)
        expect(result.data[0].tripDuration).toBe(140)
        expect(result.data[0].incidentCount).toBe(1)
        expect(result.data[0].averageSpeed).toBe(20)
        expect(result.data[0].maxSpeed).toBe(30)


        expect(result.data[1].tripID).toBe(8)
        expect(result.data[1].tripScore).toBe(167)
        expect(result.data[1].tripDuration).toBe(130)
        expect(result.data[1].incidentCount).toBe(1)
        expect(result.data[1].averageSpeed).toBe(20)
        expect(result.data[1].maxSpeed).toBe(30)


        expect(result.data[2].tripID).toBe(7)
        expect(result.data[2].tripScore).toBe(171)
        expect(result.data[2].tripDuration).toBe(120)
        expect(result.data[2].incidentCount).toBe(1)
        expect(result.data[2].averageSpeed).toBe(20)
        expect(result.data[2].maxSpeed).toBe(30)


        expect(result.data[3].tripID).toBe(6)
        expect(result.data[3].tripScore).toBe(174)
        expect(result.data[3].tripDuration).toBe(110)
        expect(result.data[3].incidentCount).toBe(1)
        expect(result.data[3].averageSpeed).toBe(20)
        expect(result.data[3].maxSpeed).toBe(30)


        expect(result.data[4].tripID).toBe(5)
        expect(result.data[4].tripScore).toBe(178)
        expect(result.data[4].tripDuration).toBe(100)
        expect(result.data[4].incidentCount).toBe(1)
        expect(result.data[4].averageSpeed).toBe(20)
        expect(result.data[4].maxSpeed).toBe(30)


    })

    it('should allow offsetting to retrieve end results', async () => {
        const DS = new Driving_Score(true)

        const result = await DS.getDrivingResults(1, 1)

        expect(result.statusCode).toBe(200)
        expect(result.message).toBe('trips fetched with offset 5')

        expect(result.data[0].tripID).toBe(4)
        expect(result.data[0].tripScore).toBe(181)
        expect(result.data[0].tripDuration).toBe(90)
        expect(result.data[0].incidentCount).toBe(1)
        expect(result.data[0].averageSpeed).toBe(20)
        expect(result.data[0].maxSpeed).toBe(30)


        expect(result.data[1].tripID).toBe(3)
        expect(result.data[1].tripScore).toBe(185)
        expect(result.data[1].tripDuration).toBe(80)
        expect(result.data[1].incidentCount).toBe(1)
        expect(result.data[1].averageSpeed).toBe(20)
        expect(result.data[1].maxSpeed).toBe(30)


        expect(result.data[2].tripID).toBe(2)
        expect(result.data[2].tripScore).toBe(189)
        expect(result.data[2].tripDuration).toBe(70)
        expect(result.data[2].incidentCount).toBe(1)
        expect(result.data[2].averageSpeed).toBe(20)
        expect(result.data[2].maxSpeed).toBe(30)


        expect(result.data[3].tripID).toBe(1)
        expect(result.data[3].tripScore).toBe(192)
        expect(result.data[3].tripDuration).toBe(60)
        expect(result.data[3].incidentCount).toBe(1)
        expect(result.data[3].averageSpeed).toBe(20)
        expect(result.data[3].maxSpeed).toBe(30)
    })

    it('should return nothing if there is no trips', async () => {
        const DS = new Driving_Score(true)

        const result = await DS.getDrivingResults(1, 2)

        expect(result.statusCode).toBe(404)
        expect(result.message).toBe('No objects found')
    })

    it('should deny if invalid userID', async () => {
        const DS = new Driving_Score(true)

        const result = await DS.getDrivingResults('invalid ID', 2)
        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Invalid userID")
        
    })

    it('should deny if invalid offset type', async () => {
        const DS = new Driving_Score(true)

        const result = await DS.getDrivingResults(1, "2")
        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Invalid offset provided")
    })

    it('should deny if offset is below minimum', async () => {
        const DS = new Driving_Score(true)

        const result = await DS.getDrivingResults(1, -1)
        expect(result.statusCode).toBe(400)
        expect(result.message).toBe("Invalid offset provided")
    })


})