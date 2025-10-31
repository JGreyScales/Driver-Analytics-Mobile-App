const CryptoJS = require('crypto-js');

class PasswordHash {
  static HashMethod(passwordInput) {
    // RETURNS EMPTY STRING ON FAILURE
    try {
      if (typeof passwordInput !== "string" || passwordInput.length < 8) {
        throw new Error("Invalid Password");
      }

      // MD5 hash
      const hashed = CryptoJS.MD5(passwordInput).toString();

      return hashed;
    } catch (err) {
      return "";
    }
  }
}

module.exports = PasswordHash;
