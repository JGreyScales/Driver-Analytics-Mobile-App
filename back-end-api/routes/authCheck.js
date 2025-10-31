const express = require("express");
const router = express.Router();
const JWT_AUTH = require("../middleware/auth")

router.get("/", async (req, res) => {
    try {
        await JWT_AUTH.authenticateToken(req)
        res.status(200).send({statusCode: 200, message: 'Valid token provided'})
    } catch (e) {
        res.status(401).send({statusCode: 401, message: 'Invalid token provided'})
    }
})


module.exports = router;