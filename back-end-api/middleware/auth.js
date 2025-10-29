const jwt = require("jsonwebtoken")
const dataType = require('../utils/dataType')

class JWT_AUTH {
    constructor(){}

    static __extractToken(req){
        let token = undefined;
        if (typeof(req) === 'string'){token = req?.split(' ')[1]}
        else {token = req.header('Authorization')?.split(' ')[1];}
        return token
    }

    static generateToken(userID){
        return jwt.sign(
            {'userID': userID},
            process.env.JWT_SECRET,
            {'expiresIn':'1h'}
        )
    }

    static authenticateToken(req){
        const token = this.__extractToken(req);        
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) return reject(false);
            if (!dataType.isDefined(payload.userID)) return reject(false)
                
            return resolve(true)
        })
    }

    static getUserIDFromToken(req){
        return new Promise((resolve, reject) => {
            const token = this.__extractToken(req);
            jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) return reject(0);
                return resolve(payload.userID)
            })
        })
    }

}

module.exports = JWT_AUTH