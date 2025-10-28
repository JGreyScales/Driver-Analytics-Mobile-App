const express = require("express");
const User = require("../controllers/user")
const router = express.Router();


router.put("/", (req, res) => {
    res.status(200).send("User placed")
})


module.exports = router;