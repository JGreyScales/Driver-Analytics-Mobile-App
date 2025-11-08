import { uploadDriverScore } from "../../src/utils/JourneyDataUploader";
import SessionManager from "../../src/utils/SessionManager";
import AsyncStorage from '@react-native-async-storage/async-storage';

//Mock dependencies
jest.mock("../../src/utils/SessionManager");
global.fetch = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn().mockResolvedValue('mockToken'),
  removeItem: jest.fn(),
}));

describe("uploadDriverScore", () => {
  let mockManager;
  beforeEach(() => {
    jest.clearAllMocks();
    mockManager = {
      getToken: jest.fn(),
    };
    SessionManager.mockImplementation(() => mockManager);

    console.warn = jest.fn();
    console.error = jest.fn();
    console.log = jest.fn();
  });

  test("returns false if no token found", async () => {
    mockManager.getToken.mockResolvedValue(null);
    const result = await uploadDriverScore({
      tripDuration: 30,
      incidentCount: 1,
      averageSpeed: 60,
      maxSpeed: 100,
    });
    expect(console.warn).toHaveBeenCalledWith("JWT token not found — skipping upload.");
    expect(result).toBe(false);
  });

  test("returns true on successful upload", async () => {
    mockManager.getToken.mockResolvedValue("testToken");
    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify({ statusCode: 200, message: "User updated" })),
    });
    const result = await uploadDriverScore({
      tripDuration: 45,
      incidentCount: 0,
      averageSpeed: 55,
      maxSpeed: 80,
    });
    expect(fetch).toHaveBeenCalledWith("http://10.0.2.2:3000/driving/score",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ Authorization: "testToken" }),
      })
    );
    expect(console.log).toHaveBeenCalledWith(
      "Journey data uploaded successfully:",
      expect.any(Object)
    );
    expect(result).toBe(true);
  });

  test("returns false on failed upload", async () => {
    mockManager.getToken.mockResolvedValue("fakeToken");
    fetch.mockResolvedValueOnce({
      ok: false,
      text: jest.fn().mockResolvedValue(JSON.stringify({ statusCode: 400, message: "Invalid body" })),
    });

    const result = await uploadDriverScore({
      tripDuration: 0,
      incidentCount: 2,
      averageSpeed: 50,
      maxSpeed: 40,
    });

    expect(console.error).toHaveBeenCalledWith(
      "Upload failed:",
      expect.any(Object)
    );
    expect(result).toBe(false);
  });

  test("handles non-JSON backend response gracefully", async () => {
    mockManager.getToken.mockResolvedValue("validToken");
    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue("<html>Success</html>"),
    });

    const result = await uploadDriverScore({
      tripDuration: 10,
      incidentCount: 1,
      averageSpeed: 40,
      maxSpeed: 60,
    });

    expect(result).toBe(true);
    expect(console.log).toHaveBeenCalledWith(
      "Journey data uploaded successfully:",
      null
    );
  });

  test("returns false and logs error if fetch throws", async () => {
    mockManager.getToken.mockResolvedValue("token");
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await uploadDriverScore({
      tripDuration: 30,
      incidentCount: 0,
      averageSpeed: 55,
      maxSpeed: 70,
    });

    expect(console.error).toHaveBeenCalledWith(
      "Error uploading driver data:",
      expect.any(Error)
    );
    expect(result).toBe(false);
  });
});
