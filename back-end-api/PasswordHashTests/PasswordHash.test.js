const bcrypt = require('bcrypt'); 
const PasswordHash = require("../PasswordHash/PasswordHash.js"); 

describe('Hash Method', () => {
    test('should hash password correctly', async () => {
        const passwordInput = "pass122345"; 
        const hashed = await PasswordHash.HashMethod(passwordInput);
        const compare = await bcrypt.compare(passwordInput, hashed); 
        expect(compare).toBe(true); 
    })
});