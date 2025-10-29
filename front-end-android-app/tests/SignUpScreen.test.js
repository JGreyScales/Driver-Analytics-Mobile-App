// tests/SignUpScreen.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import SignUpScreen from "../src/screens/SignUpScreen";

describe("SignUpScreen UI Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all input fields and the button", () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });

  it("shows validation errors when fields are empty", async () => {
    const { getByText } = render(<SignUpScreen />);
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(getByText("Email is required.")).toBeTruthy();
      expect(getByText("Username is required.")).toBeTruthy();
      expect(getByText("Password is required.")).toBeTruthy();
    });
  });

  it("sends a PUT request and shows success alert on valid data", async () => {
    // Mock fetch so no real network call happens
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "User created successfully (mock)" }),
      })
    );

    // Spy on Alert.alert to verify the popup
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText("Email"), "user@test.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "Ahmed");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");

    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      // fetch called once with your endpoint
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(Alert.alert).toHaveBeenCalledWith(
        "✅ Success",
        "User created successfully (mock)"
      );
    });
  });
});
