let Database = require("../models/db")
let dataTypes = require("../utils/dataType")
let User = require("./user")

class Driving_Score {
    "ONLY ALIVE FOR ONE CYCLE, ONCE A COMMAND IS RAN THEY WILL CLOSE THEIR CONNECTION"
    constructor(testing = false) {
        this.db = new Database(testing)
        this.testing = testing
    }

    async uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID){
        try{
            // defination checking the parameters
            if ((!Number.isInteger(tripDuration) && tripDuration >= 0) ||
             !Number.isInteger(incidentCount) ||
              !dataTypes.isValidDrivingParam(averageSpeed) ||
               !dataTypes.isValidDrivingParam(maxSpeed) ||
                !dataTypes.isID(userID) ||
                 maxSpeed < averageSpeed){
                throw {statusCode: 400, message: "Invalid parameters"}
            }

            // used AI (GPT-5 free) to assist with weightings because I am very tired and this is just basic math

            // uses Math.Min to clamp, it selects the lowest value of the two. All driving scores can be beween 0-0.99999, if they go above that they return 1
            const normalizedDuration = Math.min(tripDuration / 180, 1);  "MUST BE IN MINUTES"// 0–3 hours min maps to 0–1 
            const normalizedIncidents = Math.min(incidentCount / 10, 1); "INT"// 0–10+ incidents = 0–1
            const normalizedAvgSpeed = Math.min(averageSpeed / 60, 1);  "MUST BE IN KM/H"// 0–60 km/h = 0–1
            const normalizedMaxSpeed = Math.min(maxSpeed / 100, 1);      "MUST BE IN KM/H"// 0–100 km/h = 0–1
            
            
            
            // calculates a weighted score value for the trip
            // the "worst" score you can get from the weightedScore = 1.0 (100%)
            // the "best" score you can get from weightedScore = 0.0 (0%)
            const weightedScore =
            (normalizedDuration * 0.25) +
            (normalizedIncidents * 0.35) +
            (normalizedAvgSpeed * 0.25) +
            (normalizedMaxSpeed * 0.15);

            // users start with max score, and all of the above reduce score
            const tripScore = 255 - Math.round(weightedScore * 255);

            // averages this score to the global score
            const query = `SELECT score, tripCount FROM ${this.db.userScoreTable} WHERE userID = ? LIMIT 1`
            const params = [userID]

            let tripcount = 0 
            let currentScore = 0
            await this.db.connect()
            const result = await this.db.fetchQuery(query, params)
            // if a user tripcount corrupts or breaks, just reset their entire score
            if (!dataTypes.isDefined(result[0].tripCount)){
                tripcount = 0;
                currentScore = 0;
            } else {
                tripcount = result[0].tripCount
                // score is NULL for freshly created users, this prevents errors caused by that
                currentScore = dataTypes.isDefined(result[0].score) ? result[0].score : 0 
            }


            // averaging data incrementally over time standard equation
            const updatedScore = Math.round(((currentScore * tripcount) + tripScore) / (tripcount + 1))

            // updates the new score in the database
            const userObj = new User(this.testing)
            const updateResult = await userObj.updateUserDetails({score: updatedScore, tripCount: tripcount + 1}, userID)

            const storeSessionQuery = `INSERT INTO ${this.db.tripsTable} (
                tripScore, 
                tripDuration,
                incidentCount,
                averageSpeed,
                maxSpeed
                ) VALUES (?, ?, ?, ?, ?)`
            const tripParams = [tripScore, tripDuration, incidentCount, averageSpeed, maxSpeed]
            
            const tripID = (await this.db.submitQuery(storeSessionQuery, tripParams)).insertId

            const createBridgeQuery = `INSERT INTO ${this.db.userBridgeTable} (userID, tripID) VALUES (?, ?)`
            const bridgeParams = [userID, tripID]

            await this.db.submitQuery(createBridgeQuery, bridgeParams)

            return updateResult
        } catch (e) {
            if (dataTypes.isDict(e)) {
                return e
            } else {
                console.log(e)
                return {statusCode: 500, message: 'Unknown serverside error'}
            } 
        } finally {
            await this.db.close()
        }
    }

    async getComparativeScore(userID){
        try {
            if (!dataTypes.isID(userID)) {throw {statusCode:400, message:"Invalid userID"}}

            const globalQuery = `SELECT MIN(score) AS minScore, MAX(score) AS maxScore from ${this.db.userScoreTable}`
            const userQuery = `SELECT score FROM ${this.db.userScoreTable} WHERE userID = ?`
            const userQueryParams = [userID]


            await this.db.connect()
            const globalScoreResult = await this.db.fetchQuery(globalQuery, [])
            const userScoreResult = await this.db.fetchQuery(userQuery, userQueryParams)
 
            const userScore = userScoreResult[0].score
            const maxScore = globalScoreResult[0].maxScore
            const minScore = globalScoreResult[0].minScore

            if(!Number.isInteger(userScore) || !Number.isInteger(maxScore) || !Number.isInteger(minScore)){
                throw {statusCode: 500, message:"Not all values could be gathered"}
            }

            if (maxScore === minScore) {return {statusCode: 200, message: 'No other scores to compare to', data: {comparativeScore: 100.00}}}

            const comparativeScore = parseFloat((((userScore - minScore) / (maxScore - minScore)) * 100).toFixed(2))

            if (comparativeScore === NaN) {
                throw {statusCode: 500, message: 'Unable to properly compute comparativeScore'}
            }
            return {statusCode: 200, message: 'comparativeScore computed', data: {comparativeScore: comparativeScore}}
        } catch (e) {
            if (dataTypes.isDict(e)) {
                return e
            } else {
                return {statusCode: 500, message: 'Unknown serverside error'}
            } 
        } finally {
            await this.db.close()
        }
    }
}

module.exports = Driving_Score