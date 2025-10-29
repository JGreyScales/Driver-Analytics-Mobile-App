class dataTypes{
    constructor(){}

    static isDict(value){
        try{
            return value.constructor == Object
        } catch {
            return false
        }
    }

    static isDefined(value){
        try {
            return value != null
        } catch {
            return false
        }
    }
}

module.exports = dataTypes