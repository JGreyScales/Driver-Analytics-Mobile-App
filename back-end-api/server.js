const cors = require('cors');
const assurance = require("./routes/assurance")
const user = require("./routes/user")
const authCheck = require("./routes/authCheck")
const drivingScore = require("./routes/drivingScore")

require('dotenv').config({ quiet: true }); // load the .env file into memory

const express = require('express');
const app = express();

const corsOptions = {
    origin: '*', // Allow all origins
};
app.use(cors(corsOptions));


app.use(express.json()); // use json for incoming payloads
app.use("/status", assurance);
app.use("/user", user);
app.use("/auth", authCheck);
app.use("/driving", drivingScore)

const PORT = process.env.PORT || 3000;
// listen on all network intefaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});