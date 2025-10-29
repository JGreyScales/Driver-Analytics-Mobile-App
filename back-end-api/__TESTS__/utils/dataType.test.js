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