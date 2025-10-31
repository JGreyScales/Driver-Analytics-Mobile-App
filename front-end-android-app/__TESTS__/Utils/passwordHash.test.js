const PasswordHash = require("../../src/utils/passwordHash");

describe('Hash Method', () => {
  test('should hash password', () => {
    const passwordInput = "pass122345"; 
    const hashed = PasswordHash.HashMethod(passwordInput);
    expect(typeof hashed).toBe("string");
    expect(hashed).not.toBe(passwordInput);
  });

  test('should deny passwords under 8 characters', () => {
    const hashed = PasswordHash.HashMethod("1234567");
    expect(hashed).toBe("");
  });

  test('should deny ints', () => {
    const hashed = PasswordHash.HashMethod(-123455);
    expect(hashed).toBe(""); 
  });

  test('should deny floats', () => {
    const hashed = PasswordHash.HashMethod(1.0022);
    expect(hashed).toBe("");  
  });

  test('should deny undefined', () => {
    const hashed = PasswordHash.HashMethod(undefined);
    expect(hashed).toBe("");  
  });

  test('should deny empty', () => {
    const hashed = PasswordHash.HashMethod("");
    expect(hashed).toBe("");  
  });
});
