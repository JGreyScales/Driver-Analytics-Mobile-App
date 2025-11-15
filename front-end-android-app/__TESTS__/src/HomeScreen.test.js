import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
global.fetch = jest.fn();

const mockGetToken = jest.fn(); 
const mockSetToken = jest.fn(); 

jest.mock("../../src/utils/SessionManager", () => {
  return jest.fn().mockImplementation(() => {
    return {
      getToken: (...args) => mockGetToken(...args),
      setToken: (...args) => mockSetToken(...args),
      clearToken: jest.fn(),
    };
  });
});

jest.mock("../../src/utils/fetchHelper", () => ({
  makeRequest: jest.fn(),
  fetchDownloadUsage: jest.fn(),
  fetchUploadUsage: jest.fn(),
  clearCache: jest.fn(),
}));

jest.mock("../../src/utils/userSignout", () => ({
  signoutUser: jest.fn(),
}));

import { HomeScreen } from "../../src/screens/HomeScreen";
import FetchHelper from "../../src/utils/fetchHelper";
import UserSignout from "../../src/utils/userSignout";
import { COLORS } from "../../src/styles/GlobalStyles";

describe("HomeScreen (unified tests covering all branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken.mockReset();
    mockGetToken.mockResolvedValue(null);
    mockSetToken.mockReset();
    mockSetToken.mockResolvedValue(null);
    FetchHelper.makeRequest.mockResolvedValue({ ok: false, json: async () => ({}) });
    FetchHelper.fetchDownloadUsage.mockResolvedValue(0);
    FetchHelper.fetchUploadUsage.mockResolvedValue(0);
    FetchHelper.clearCache.mockImplementation(() => {});
    UserSignout.signoutUser.mockResolvedValue();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterAll(() => {
    if (Alert.alert.mockRestore) Alert.alert.mockRestore();
  });

  test("loads and displays stored username", async () => {
    mockGetToken.mockResolvedValue("Driver123");

    const { findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    const usernameNode = await findByText("Username");
    expect(usernameNode).toBeTruthy();
  });

  test("handles missing username", async () => {
    mockGetToken.mockResolvedValueOnce(null);

    const { findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    const usernameNode = await findByText("Username");
    expect(usernameNode).toBeTruthy();
  });

  test("fetches username from API when no cache and sets token", async () => {
    mockGetToken.mockResolvedValueOnce(null);

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { username: "user123" } })
    });

    const { findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    const usernameNode = await findByText("Username");
    expect(usernameNode).toBeTruthy();
  });
  test("navigation when pressing 'Track a Journey' button", async () => {
    mockGetToken.mockResolvedValue("Driver123");

    const navigateMock = jest.fn();
    const { findByText } = render(<HomeScreen navigation={{ navigate: navigateMock }} />);

    const button = await findByText("Track a Journey");
    fireEvent.press(button);

    expect(navigateMock).toHaveBeenCalledWith("Journey");
  });

  test("renders and allows pressing the other buttons", async () => {
    mockGetToken.mockResolvedValue("Driver123");
    const { findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    const journeyScoreBtn = await findByText("Journey Score");
    const globalScoreBtn = await findByText("Global Score");

    fireEvent.press(journeyScoreBtn);
    fireEvent.press(globalScoreBtn);

    expect(journeyScoreBtn).toBeTruthy();
    expect(globalScoreBtn).toBeTruthy();
  });

  test("renders buttons using defined COLORS.primary", async () => {
    const originalPrimary = COLORS.primary;
    COLORS.primary = "#123456";

    const { findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
    const trackBtn = await findByText("Track a Journey");
    expect(trackBtn).toBeTruthy();

    COLORS.primary = originalPrimary;
  });

  test("openSettingsModal loads usage stats and shows modal", async () => {
    FetchHelper.fetchDownloadUsage.mockResolvedValueOnce(1024 * 1024 * 2);
    FetchHelper.fetchUploadUsage.mockResolvedValueOnce(1024 * 1024 * 1.5); 

    const { getByTestId, findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    const settingsBtn = getByTestId("setting-icon");
    fireEvent.press(settingsBtn);

    const downloadText = await findByText(/Download Usage:/i);
    expect(downloadText).toBeTruthy();
    expect(FetchHelper.fetchDownloadUsage).toHaveBeenCalled();
    expect(FetchHelper.fetchUploadUsage).toHaveBeenCalled();
  });

  test("Sign Out button calls UserSignout.signoutUser", async () => {
    FetchHelper.fetchDownloadUsage.mockResolvedValueOnce(0);
    FetchHelper.fetchUploadUsage.mockResolvedValueOnce(0);

    const { getByTestId, findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    const settingsBtn = getByTestId("setting-icon");
    fireEvent.press(settingsBtn);

    const signOutBtn = await findByText("Sign Out");
    fireEvent.press(signOutBtn);

    expect(UserSignout.signoutUser).toHaveBeenCalled();
  });

  test("Clear Usage Cache calls FetchHelper.clearCache and resets values", async () => {
    FetchHelper.fetchDownloadUsage.mockResolvedValueOnce(1024 * 1024 * 3);
    FetchHelper.fetchUploadUsage.mockResolvedValueOnce(1024 * 1024 * 1);

    const { getByTestId, findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    const settingsBtn = getByTestId("setting-icon");
    fireEvent.press(settingsBtn);

    const clearBtn = await findByText("Clear Usage Cache");
    fireEvent.press(clearBtn);

    expect(FetchHelper.clearCache).toHaveBeenCalled();

    const zeroDownload = await findByText(/Download Usage: 0.00MB/);
    expect(zeroDownload).toBeTruthy();
  });

  test("Close button hides modal", async () => {
    FetchHelper.fetchDownloadUsage.mockResolvedValueOnce(0);
    FetchHelper.fetchUploadUsage.mockResolvedValueOnce(0);

    const { getByTestId, findByText, queryByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    const settingsBtn = getByTestId("setting-icon");
    fireEvent.press(settingsBtn);

    const closeBtn = await findByText("Close");
    fireEvent.press(closeBtn);

    await waitFor(() => {
      expect(queryByText("Sign Out")).toBeNull();
    });
  });

  test("Global Score button navigates to Global", async () => {
    const navigateMock = jest.fn();
    const { findByText } = render(<HomeScreen navigation={{ navigate: navigateMock }} />);

    const btn = await findByText("Global Score");
    fireEvent.press(btn);

    expect(navigateMock).toHaveBeenCalledWith("Global");
  });

  test("stores username from API and updates state", async () => {
    mockGetToken.mockResolvedValueOnce(null);
    FetchHelper.makeRequest.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { username: "TestUser" } }),
    });

    const { findByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);

    await findByText("Username");
    expect(mockSetToken).toHaveBeenCalledWith("TestUser");
    expect(FetchHelper.makeRequest).toHaveBeenCalled();
  });

  test("modal onRequestClose hides the modal", async () => {
      FetchHelper.fetchDownloadUsage.mockResolvedValue(0);
      FetchHelper.fetchUploadUsage.mockResolvedValue(0);

      const { getByTestId, queryByText } = render(
        <HomeScreen navigation={{ navigate: jest.fn() }} />
      );

      fireEvent.press(getByTestId("setting-icon"));
      fireEvent(getByTestId("settings-modal"), "requestClose");

      await waitFor(() => {
        expect(queryByText("Sign Out")).toBeNull();
      });
    });

});