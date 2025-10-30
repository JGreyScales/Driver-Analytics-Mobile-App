const express = require("express");
const User = require("../controllers/user");
const dataTypes = require("../utils/dataType");
const JWT_AUTH = require("../middleware/auth");
const router = express.Router();


router.put("/", async (req, res) => {
    // required body is [username, email, passwordHash]
    let testing = false
    if (req.body) {testing = dataTypes.isDefined(req.body.testing)}
    if (testing) {console.log("Running put user in test mode")}
    const userObj = new User(testing)
    const result = await userObj.userCreate(req.body)
    res.status(result.statusCode).send(result)
})

router.delete("/", async (req, res) => {
    // required body is [sessionToken]
    let testing = false
    if (req.body) {testing = dataTypes.isDefined(req.body.testing)}
    if(testing) {console.log("Running delete user in test mode")}
    
    let userID = undefined
    try {
        userID = await JWT_AUTH.getUserIDFromToken(req)
    } catch (err) {
        res.status(400).send({statusCode:400, message:'No token attached'})
    }
    const userObj = new User(testing)
    const result = await userObj.deleteUser(userID)
    res.status(result.statusCode).send(result)
})

router.get("/", async (req, res) => {
    let testing = false
    if (req.body) {testing = dataTypes.isDefined(req.body.testing)}
    if(testing) {console.log("Running delete user in test mode")}

    let userID = undefined
    try {
        userID = await JWT_AUTH.getUserIDFromToken(req)
    } catch (err) {
        res.status(400).send({statusCode:400, message:'No token attached'})
    }
    const userObj = new User(testing)
    const result = await userObj.getUserDetails(userID)
    res.status(result.statusCode).send(result)
})

router.post("/", async (req, res) => {
    // required body is [username, passwordHash]
    let testing = false
    if (req.body) {testing = dataTypes.isDefined(req.body.testing)}
    if(testing) {console.log("Running post user (authenticate user)  in test mode")}

    const userObj = new User(testing)
    const result = await userObj.authenticateUser(req.body)
    res.status(result.statusCode).send(result)
})

module.exports = router;