const bcrypt = require('bcryptjs')

class PasswordHash {
    static __saltRounds = 12; //dictates the computational cost of hashing and, consequently, the level of security 

    static async HashMethod(passwordInput) {//takes input        
        "RETURNS EMPTY STRING ON FAILURE"
        try { //code that might throw an error
            if (typeof passwordInput !== "string" || passwordInput.length === 0) { //check if input is valid first
                throw Error("Invalid Password");
            }

            const hash = await bcrypt.hash(passwordInput, this.__saltRounds);
            return hash; //returns hash string

        } catch (err) { //what to do with the error
            return "";
        }
    }
}

module.exports = PasswordHash; 