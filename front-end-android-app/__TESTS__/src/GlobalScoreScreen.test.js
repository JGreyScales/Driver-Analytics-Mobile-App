import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import SessionManager from "../../src/utils/SessionManager";
import FetchHelper from "../../src/utils/fetchHelper";
import UserSignout from "../../src/utils/userSignout";
import GlobalScoreScreen from "../../src/screens/GlobalScoreScreen";
import {Alert} from "react-native";

jest.mock("../../src/utils/fetchHelper", () => ({
  makeRequest: jest.fn(),
}));

jest.mock("../../src/utils/SessionManager", () => {
  return jest.fn().mockImplementation(() => ({
    getToken: jest.fn(),
    clearToken: jest.fn(),
  }));
});

const mockNavigation = {
  navigate: jest.fn(),
  reset: jest.fn(),
  replace: jest.fn(), 
  }; 

describe("Global Score Screen", () => {
    beforeEach(() => {
    jest.clearAllMocks();
  });
  it("verifies retrieval of token", async () => {
    const tokenMock = "mockToken";
    const mockResponse = {
        ok: true, 
        json: async () => ({statusCode: 200, data: {score: 90, comparativeScore: 85}}),
    };
    SessionManager.mockImplementation(() => ({
        getToken: jest.fn().mockResolvedValue(tokenMock),
    }));
    FetchHelper.makeRequest.mockResolvedValue(mockResponse); 
    render(<GlobalScoreScreen navigation={mockNavigation} />);

    await waitFor(() => {
        expect(FetchHelper.makeRequest).toHaveBeenCalledWith(
            "http://10.0.2.2:3000/user",
        "GET",
        expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenMock}`,
        })
      );
    });
  });

  it("displays fetched scores when API returns success", async () => {
    SessionManager.mockImplementation(() => ({
      getToken: jest.fn().mockResolvedValue("validToken"),
    }));
    FetchHelper.makeRequest.mockResolvedValue({
      ok: true,
      json: async () => ({ statusCode: 200, data: { setScoreData: {score: 88} , setComparativeScore: {score: 77} } }),
    });

    const { getByText } = render(<GlobalScoreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("Global Score:")).toBeTruthy();
      expect(getByText("Comparative Score:")).toBeTruthy();
      expect(getByText("88")).toBeTruthy();
      expect(getByText("77")).toBeTruthy();
    });
  });

  it("sets score to 0 when API returns null", async () => {
    SessionManager.mockImplementation(() => ({
      getToken: jest.fn().mockResolvedValue("token123"),
    }));
    FetchHelper.makeRequest.mockResolvedValue({
      ok: true,
      json: async () => ({ statusCode: 200, data: { setScoreData: null, setComparativeScore: null, }, }),
    });

    const { getByText } = render(<GlobalScoreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("0")).toBeTruthy();
    });
  });

  it("alerts the user if API returns unauthorized (401)", async () => {
    const alertMock = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    SessionManager.mockImplementation(() => ({
      getToken: jest.fn().mockResolvedValue("wrongToken"),
      clearToken: jest.fn(),
    }));
    FetchHelper.makeRequest.mockResolvedValue({
      ok: false,
      json: async () => ({ statusCode: 401, message: "Unauthorized" }),
    });

    render(<GlobalScoreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(FetchHelper.makeRequest).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });

  it("navigates to Home when Back button is pressed", async () => {
    SessionManager.mockImplementation(() => ({
      getToken: jest.fn().mockResolvedValue("tokenABC"),
    }));
    FetchHelper.makeRequest.mockResolvedValue({
      ok: true,
      json: async () => ({ statusCode: 200, data: { score:{socre: 10}, comparativeScore:{comparativeScore: 5} } }),
    });

    const { getByText } = render(<GlobalScoreScreen navigation={mockNavigation} />);

    await waitFor(() => {
      fireEvent.press(getByText("Back"));
      expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");
    });
  });
  it("handles fetch errors and sets errors", async () => { 
    const mockError = jest.spyOn(console, "error").mockImplementation(()=> {}); 

    SessionManager.mockImplementation(() => ({
      getToken: jest.fn().mockResolvedValue("validToken"), 
    }));

    SessionManager.mockImplementation(() => ({
      getToken: jest.fn().mockResolvedValue("ValidToken"), 
      clearToken: jest.fn(),
}));

    FetchHelper.makeRequest.mockRejectedValue(new Error("Network failure"));

    const {getByText } = render( 
      <GlobalScoreScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(mockError).toHaveBeenCalled();
    });
  })

});