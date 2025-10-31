import bcrypt from "bcryptjs";
import * as Crypto from "expo-crypto";

class Password_Hash {
  static __saltRounds = 12;

  // ✅ Secure RNG using Expo Crypto
  static initializeRandom() {
    bcrypt.setRandomFallback((len) => {
      const buf = Crypto.getRandomBytes(len);
      return Array.from(buf);
    });
  }

  static async HashMethod(passwordInput) {
    try {
      if (typeof passwordInput !== "string" || passwordInput.length === 0) {
        throw Error("Invalid Password");
      }

      this.initializeRandom();

      const salt = await bcrypt.genSalt(this.__saltRounds);
      return bcrypt.hash(passwordInput, salt);

    } catch (err) {
      console.log("Password hashing failed:", err);
      return "";
    }
  }
}

export default Password_Hash;