const dataType = require("../../utils/dataType")

describe('validate isDict assert accuracy', () => {
    it('should allow dicts', () => {
        const value = {somedict: "someValue"}

        expect(dataType.isDict(value)).toBeTruthy()
    })

    it('should deny strings', () => {
        const value = "someValue"

        expect(dataType.isDict(value)).toBeFalsy()
    })

    it('should deny ints', () => {
        const value = 1231

        expect(dataType.isDict(value)).toBeFalsy()
    })

    it('should deny floats', () => {
        const value = 1231.1231

        expect(dataType.isDict(value)).toBeFalsy()
    })

    it('should deny undefined', () => {
        let value = undefined

        expect(dataType.isDict(value)).toBeFalsy()
    })

    it('should deny objects', () => {
        const value = [324, 2342, 2342]

        expect(dataType.isDict(value)).toBeFalsy()
    })
})

describe('validate isDefined assert accuracy', () => {
    it('should allow dicts', () => {
        const value = {somedict: "someValue"}

        expect(dataType.isDict(value)).toBeTruthy()
    })

    it('should allows strings', () => {
        const value = "someValue"

        expect(dataType.isDefined(value)).toBeTruthy()
    })

    it('should allows ints', () => {
        const value = 1231

        expect(dataType.isDefined(value)).toBeTruthy()
    })

    it('should allows floats', () => {
        const value = 1231.1231

        expect(dataType.isDefined(value)).toBeTruthy()
    })

    it('should allow objects', () => {
        const value = [324, 2342, 2342]

        expect(dataType.isDefined(value)).toBeTruthy()
    })

    it('should deny undefined', () => {
        let value = undefined

        expect(dataType.isDefined(value)).toBeFalsy()
    })

    it('should deny null', () => {
        let value = null
        expect(dataType.isDefined(value)).toBeFalsy()
    })
})

describe('validate isID assert accuracy', () => {
    it('should allow ints above 0', () => {
        const value = 1231

        expect(dataType.isID(value)).toBeTruthy()
    })

    it('should deny dicts', () => {
        const value = {somedict: "someValue"}

        expect(dataType.isID(value)).toBeFalsy()
    })

    it('should deny strings', () => {
        const value = "someValue"

        expect(dataType.isID(value)).toBeFalsy()
    })

    it('should deny ints at 0', () => {
        const value = 0

        expect(dataType.isID(value)).toBeFalsy()
    })

    it('should deny ints below 0', () => {
        const value = -1

        expect(dataType.isID(value)).toBeFalsy()
    })

    it('should deny floats', () => {
        const value = 1231.1231

        expect(dataType.isID(value)).toBeFalsy()
    })

    it('should deny objects', () => {
        const value = [324, 2342, 2342]

        expect(dataType.isID(value)).toBeFalsy()
    })

    it('should deny undefined', () => {
        let value = undefined

        expect(dataType.isID(value)).toBeFalsy()
    })

    it('should deny null', () => {
        let value = null
        expect(dataType.isID(value)).toBeFalsy()
    })
})

describe('validate exists assert accuracy', () => {
    it('should return true for null', () => {
        expect(dataType.exists(null)).toBeTruthy()
    })

    it('should return true for ints', () => {
        expect(dataType.exists(1)).toBeTruthy()
    })

    it('should return true for strings', () => {
        expect(dataType.exists("dfs")).toBeTruthy()
    })

    it('should return true for objects', () => {
        expect(dataType.exists([])).toBeTruthy()
    })

    it('should return false for intentional undefined', () => {
        expect(dataType.exists(undefined)).toBeFalsy()
    })

    it('should return false for unintentional undefined', () => {
        let value
        expect(dataType.exists(value)).toBeFalsy()
    })
})