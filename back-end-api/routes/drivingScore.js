const express = require("express");
const router = express.Router();
const Driving_Score = require('../controllers/drivingScore')
const dataTypes = require("../utils/dataType")
const JWT_AUTH = require("../middleware/auth")
const { validateGetScore, validatePutScore } = require("../validation/drivingScore")

router.put("/score", validatePutScore, async(req, res) => {
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
    let lat = req.body.startLat
    let long = req.body.startLong

    if ((!Number.isInteger(tripDuration) && tripDuration >= 0) ||
    !Number.isInteger(incidentCount) ||
     !dataTypes.isValidDrivingParam(averageSpeed) ||
      !dataTypes.isValidDrivingParam(maxSpeed) ||
        maxSpeed < averageSpeed){
          console.log(tripDuration, incidentCount, averageSpeed, maxSpeed)
          console.log(typeof tripDuration, typeof incidentCount, typeof averageSpeed, typeof maxSpeed)
        res.status(400).send({statusCode:400, message:"Invalid body"})
      }

    const DS = new Driving_Score(testing)
    const result = await DS.uploadNewDrivingScore(tripDuration, incidentCount, averageSpeed, maxSpeed, lat, long, userID)

    res.status(result.statusCode).send(result)
})

router.get("/comparativeScore", validateGetScore, async (req, res) => {
  let testing = false
  if (req.body) {testing = dataTypes.isDefined(req.body.testing)}
  if(testing) {console.log("Running delete user in test mode")}
  
  let userID = undefined
  try {
      userID = await JWT_AUTH.getUserIDFromToken(req)
  } catch (err) {
      res.status(400).send({statusCode:400, message:'No token attached'})
  }

  const DS = new Driving_Score(testing)
  const result = await DS.getComparativeScore(userID)
  res.status(result.statusCode).send(result)
})

router.post("/history", validateGetScore, async (req, res) => {
  let testing = false
  if (req.body) {testing = dataTypes.isDefined(req.body.testing)}
  else {res.status(400).send({statusCode: 400, message:'No body attached'})}
  if(testing) {console.log("Running delete user in test mode")}
  
  let userID = undefined
  try {
      userID = await JWT_AUTH.getUserIDFromToken(req)
  } catch (err) {
      res.status(400).send({statusCode:400, message:'No token attached'})
      return
  }

  if (req.body?.offset === undefined){
    res.status(400).send({statusCode:400, message:'No offset attached'})
    return
  }


  const DS = new Driving_Score(testing)
  const result = await DS.getDrivingResults(userID, req.body.offset)
  res.status(result.statusCode).send(result)
})


module.exports = router;