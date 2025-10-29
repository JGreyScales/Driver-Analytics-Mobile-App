const bcrypt = require('bcrypt');//include bcrypt module


class PasswordHash {
    static saltRounds = 12; //dictates he computational cost of hashing and, consequently, the level of security 

    static async HashMethod(userPassword) {//takes input 
        try { //code that might thorw an error
            const hash = await bcrypt.hash(userPassword, this.saltRounds); 
            console.log("Hashed Password: ", hash); 
            return hash; //returns hash string

        }catch(err) { //what to do with the error
            console.error("Unable to Hash Password: ", err);  
            throw err; 
        }
        }
}