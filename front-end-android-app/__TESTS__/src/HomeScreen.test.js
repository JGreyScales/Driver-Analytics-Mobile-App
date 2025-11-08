import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {HomeScreen} from "../../src/screens/HomeScreen";
import { COLORS } from "../../src/styles/GlobalStyles";
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads and displays stored username", async () => {
    const { findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
    const usernameElement = await findByText("Username");
    expect(usernameElement).toBeTruthy();
  });
});

  test("handles missing username", async () => {
    AsyncStorage.getItem = jest.fn().mockResolvedValueOnce(null);

    const { getByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    await waitFor(() => expect(getByText("Username")).toBeTruthy());
  });

  test("handles storage error", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    AsyncStorage.getItem = jest.fn().mockRejectedValueOnce(new Error("Storage failed"));

    render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
    await waitFor(() =>
    expect(consoleSpy).toHaveBeenCalledWith("Error retrieving session token:", expect.any(Error))
    );
    consoleSpy.mockRestore();
  });

  test("navigation when pressing 'Track a Journey' button", async () => {
    const navigateMock = jest.fn();
    AsyncStorage.getItem = jest.fn().mockResolvedValueOnce("Driver123");

    const { getByText } = render(<HomeScreen navigation={{ navigate: navigateMock }} />);
    const button = getByText("Track a Journey");
    fireEvent.press(button);
    expect(navigateMock).toHaveBeenCalledWith("Journey");
  });

  test("renders and allows pressing the other buttons", async () => {
    AsyncStorage.getItem = jest.fn().mockResolvedValueOnce("Driver123");

    const { getByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    fireEvent.press(getByText("Journey Score"));
    fireEvent.press(getByText("Global Score"));

    expect(getByText("Journey Score")).toBeTruthy();
    expect(getByText("Global Score")).toBeTruthy();
  });

  test("renders buttons using fallback color when COLORS.primary undefined", async () => {
    const originalPrimary = COLORS.primary;
    COLORS.primary = undefined; 

    const { getByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
    await waitFor(() => expect(getByText("Track a Journey")).toBeTruthy());

    COLORS.primary = originalPrimary; 
});

  test("renders buttons using defined COLORS.primary", async () => {
    const originalPrimary = COLORS.primary;
    COLORS.primary = "#123456"; // mock a defined value

    const { getByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
    await waitFor(() => expect(getByText("Track a Journey")).toBeTruthy());

    COLORS.primary = originalPrimary; 
  });

