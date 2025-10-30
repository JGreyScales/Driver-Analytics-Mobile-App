const bcrypt = require('bcrypt'); 
const PasswordHash = require("../../front-end-android-app/utils/PasswordHash/PasswordHash.js"); 

describe('Hash Method', () => {
    test('should hash password', async () => {
        const passwordInput = "pass122345"; 
        const hashed = await PasswordHash.HashMethod(passwordInput);
        const compare = await bcrypt.compare(passwordInput, hashed); 
        expect(compare).toBe(true); 
    })


    test('should deny ints', async () => {
        const passwordInput = -123455; 
        const hashed = await PasswordHash.HashMethod(passwordInput); 
        await expect(hashed).toBeFalsy(); 
    })

    test('should deny floats', async () => {
        const passwordInput = 1.0022; 
        const hashed = await PasswordHash.HashMethod(passwordInput); 
        await expect(hashed).toBeFalsy();  
    })

    test('should deny undefined', async () => {
        const passwordInput = undefined; 
        const hashed = await PasswordHash.HashMethod(passwordInput); 
        await expect(hashed).toBeFalsy();  
    })

    test('should deny empty', async () => {
        const passwordInput = ""; 
        const hashed = await PasswordHash.HashMethod(passwordInput); 
        await expect(hashed).toBeFalsy();  
    })
});