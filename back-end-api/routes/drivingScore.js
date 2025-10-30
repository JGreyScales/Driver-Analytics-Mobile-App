const express = require("express");
const router = express.Router();
const Driving_Score = require('../controllers/drivingScore')
const dataTypes = require("../utils/dataType")
const JWT_AUTH = require("../middleware/auth")

router.put("/score", async(req, res) => {
  // required body [tripDuration, incidentCount, averageSpeed, maxSpeed]
    let testing = false
    if (req.body) {testing = dataTypes.isDefined(req.body.testing)}
    else {res.status(400).send({statusCode:400, message:'No body attached'})}
    if(testing) {console.log("Running delete user in test mode")}
    
    let userID = undefined
    try {
        userID = await JWT_AUTH.getUserIDFromToken(req)
    } catch (err) {
        res.status(400).send({statusCode:400, message:'No token attached'})
    }

    let tripDuration = req.body.tripDuration
    let incidentCount = req.body.incidentCount
    let averageSpeed = req.body.averageSpeed
    let maxSpeed = req.body.maxSpeed

    if (!dataTypes.isValidDrivingParam(tripDuration) ||
    !Number.isInteger(incidentCount) ||
     !dataTypes.isValidDrivingParam(averageSpeed) ||
      !dataTypes.isValidDrivingParam(maxSpeed) ||
        maxSpeed < averageSpeed){
        res.status(400).send({statusCode:400, message:"Invalid body"})
      }

    const DS = new Driving_Score(testing)
    const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, userID)

    res.status(result.statusCode).send(result)
})

router.get("/comparativeScore", async (req, res) => {

})


module.exports = router;