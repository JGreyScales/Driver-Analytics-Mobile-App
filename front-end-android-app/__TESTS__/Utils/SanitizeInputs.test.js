import { emailInputSanitize } from "../../src/utils/SanitizeInputs";
import { passWordInputSanitize } from "../../src/utils/SanitizeInputs";
import { userNameInputSanitize } from "../../src/utils/SanitizeInputs";

describe("Sanitize Email Inputs", () => {

    test("removes invalid characters", () => {
        expect(emailInputSanitize("something#@gmail.com")).toBe("something@gmail.com")
    });
    test("keeps valid characters", () => {
        expect(emailInputSanitize("something@gmail.com")).toBe("something@gmail.com")
    });
});

describe("Sanitize Username Inputs", () => {
    
    test("removes invalid characters", () =>{
        expect(userNameInputSanitize("something!@#$")).toBe("something")
    });
    test("includes valid characters", () => {
        expect(userNameInputSanitize("something")).toBe("something")
    });
});

describe("Sanitize Password Inputs", () => {

    test("Removes invalid characters", () => {
        expect(passWordInputSanitize("1234<5>")).toBe("12345"); 
    })
    test("Includes valid characters", () => {
        expect(passWordInputSanitize("12345")).toBe("12345"); 
    })
})