const bcrypt = require('bcrypt');//include bcrypt module
const saltRounds = 10; //dictates he computational cost of hashing and, consequently, the level of security

bcrypt.genSalt(saltRounds, (err, salt) => {
if (err) {
    errormsg.Text = "Unable to generate salt"; 
    return;
}
console.log("Salt Generation Successful"); // Salt generation successful, proceed to hash the password
});

const userPassword = '1234password'; 
bcrypt.hash(userPassword, salt, (err, hash) => {
    if(err){
        errormsg.Text = "unable to hash user password";
    }

    console.log("Hashed Password: ", hash); //hashing successful
});

