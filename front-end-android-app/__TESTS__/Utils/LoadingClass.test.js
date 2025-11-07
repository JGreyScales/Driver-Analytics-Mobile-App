import React from "react";
import { renderer, waitFor, render } from "@testing-library/react-native";
import { ActivityIndicator, Alert, Text } from "react-native";
import { LoadingAuthManager, withAuthLoading } from "../../src/utils/LoadingClass";
import SessionManager from "../../src/utils/SessionManager";
// Mock console methods so we can assert on them
jest.spyOn(global.console, "log").mockImplementation(() => {});
jest.spyOn(global.console, "error").mockImplementation(() => {});
global.fetch = jest.fn();
jest.spyOn(Alert, "alert").mockImplementation(() => {});

jest.mock("../../src/utils/SessionManager", () => {
  return jest.fn().mockImplementation(() => ({
    getToken: jest.fn().mockResolvedValue("fake_token"),
    clearToken: jest.fn(),
  }));
});

describe("LoadingAuthManager", () => {
  const mockNavigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to SignIn when no token exists", async () => {
    const mockManager = {
      getToken: jest.fn().mockResolvedValue(null),
      clearToken: jest.fn(),
    };
    SessionManager.mockImplementation(() => mockManager);

    const auth = new LoadingAuthManager(mockNavigation);
    const result = await auth.authenticate();

    expect(result).toBe(false);
    expect(mockNavigation.replace).toHaveBeenCalledWith("SignIn");
    expect(console.log).toHaveBeenCalledWith("No token found — redirecting to SignIn");
  });

  test("returns true when token is valid", async () => {
    const mockManager = {
      getToken: jest.fn().mockResolvedValue("valid-token"),
      clearToken: jest.fn(),
    };
    SessionManager.mockImplementation(() => mockManager);
    fetch.mockResolvedValueOnce({ ok: true });

    const auth = new LoadingAuthManager(mockNavigation);
    const result = await auth.authenticate();

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith("http://10.0.2.2:3000/auth/", expect.any(Object));
    expect(console.log).toHaveBeenCalledWith("Token verified");
  });

  test("clears token and redirects when invalid/expired", async () => {
    const mockManager = {
      getToken: jest.fn().mockResolvedValue("bad-token"),
      clearToken: jest.fn(),
    };
    SessionManager.mockImplementation(() => mockManager);
    fetch.mockResolvedValueOnce({ ok: false });

    const auth = new LoadingAuthManager(mockNavigation);
    const result = await auth.authenticate();

    expect(result).toBe(false);
    expect(mockManager.clearToken).toHaveBeenCalled();
    expect(mockNavigation.replace).toHaveBeenCalledWith("SignIn");
    expect(console.log).toHaveBeenCalledWith("Invalid or expired token");
  });

  test("handles fetch/network errors gracefully", async () => {
    const mockManager = {
      getToken: jest.fn().mockResolvedValue("some-token"),
      clearToken: jest.fn(),
    };
    SessionManager.mockImplementation(() => mockManager);
    fetch.mockRejectedValueOnce(new Error("Network fail"));

    const auth = new LoadingAuthManager(mockNavigation);
    const result = await auth.authenticate();

    expect(result).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith("Error", "Network or token error occurred");
    expect(console.error).toHaveBeenCalledWith("Error verifying token:", expect.any(Error));
    expect(mockNavigation.replace).toHaveBeenCalledWith("SignIn");
  });
});

describe("withAuthLoading", () => {
  const DummyScreen = () => <Text>Authenticated Screen</Text>;
  const Wrapped = withAuthLoading(DummyScreen);
  const mockNavigation = { replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading indicator initially", () => {
    const { getByText } = render(<Wrapped navigation={mockNavigation} />);
    expect(getByText("Authenticating...")).toBeTruthy();
  });

  test("renders wrapped component after authentication", async () => {
    // Mock authenticate to resolve quickly
    const mockAuth = {
      authenticate: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(require("../../src/utils/LoadingClass"), "LoadingAuthManager")
      .mockImplementation(() => mockAuth);

    const { getByText } = render(<Wrapped navigation={mockNavigation} />);

    await waitFor(() => expect(getByText("Authenticated Screen")).toBeTruthy());
  });
  
  test("renders loading indicator while authenticating", () => {
    const Dummy = () => <Text>Protected</Text>;
    const Wrapped = withAuthLoading(Dummy);
    const mockAuth = {
      authenticate: jest.fn(() => new Promise(() => {})),
    };

    jest.spyOn(require("../../src/utils/LoadingClass"), "LoadingAuthManager")
        .mockImplementation(() => mockAuth);

    const { getByText, UNSAFE_getByType } = render(
      <Wrapped navigation={{ replace: jest.fn() }} />
    );

    const spinner = UNSAFE_getByType(ActivityIndicator);
    expect(spinner).toBeTruthy();
    expect(getByText("Authenticating...")).toBeTruthy();
  });
});
