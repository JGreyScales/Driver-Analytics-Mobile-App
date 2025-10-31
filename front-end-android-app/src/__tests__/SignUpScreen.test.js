import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignUpScreen from "../src/screens/SignUpScreen";
import PasswordHash from "../src/utils/passwordHash";

// ✅ Mock hash function
jest.mock("../src/utils/passwordHash", () => ({
  HashMethod: jest.fn(() => "mockHashedPassword123"),
}));

// ✅ Mock Alert
jest.spyOn(global, "alert").mockImplementation(() => {});
jest.spyOn(global, "console", "log").mockImplementation(() => {});

// ✅ Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Account created successfully!" }),
  })
);

describe("SignUpScreen Tests", () => {
  it("renders input fields + button", () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });

  it("shows validation errors when submitting empty form", async () => {
    const { getByText, findByText } = render(<SignUpScreen />);

    fireEvent.press(getByText("Sign Up"));

    expect(await findByText("Email is required.")).toBeTruthy();
    expect(await findByText("Username is required.")).toBeTruthy();
    expect(await findByText("Password is required.")).toBeTruthy();
  });

  it("calls hashing + API on valid signup", async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Email"), "test@mail.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "Liban");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");

    fireEvent.press(getByText("Sign Up"));

    // ✅ hashing called
    expect(PasswordHash.HashMethod).toHaveBeenCalledWith("password123");

    // ✅ API called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://10.0.2.2:3000/user/",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Liban",
            email: "test@mail.com",
            passwordHash: "mockHashedPassword123",
            testing: true,
          }),
        })
      );
    });
  });
});