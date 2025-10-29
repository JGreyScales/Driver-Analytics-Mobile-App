const express = require("express");
const User = require("../controllers/user");
const dataTypes = require("../utils/dataType");
const router = express.Router();


router.put("/", async (req, res) => {
    // required body is [username, email, passwordHash]
    testing = false
    if (req.body) {testing = dataTypes.isDefined(req.body.testing)}
    if (testing) {console.log("Running put user in test mode")}
    let userObj = new User(testing)
    let result = await userObj.userCreate(req.body)
    res.status(result.statusCode).send(result)
})


module.exports = router;