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
        return value != null
    }

    // wrapper for this.isID
    static isValidDrivingParam(value){
        return this.isID(value)
    }

    static isID(value){
        return (Number.isInteger(value) && value > 0)
    }

    static exists(value){
        return value !== undefined
    }
}

module.exports = dataTypes