import AsyncStorage from '@react-native-async-storage/async-storage';
import SessionManager from '../utils/SessionManager';
 
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');


jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
 
describe('SessionManager', () => {
  const testKey = '@testSession';
  const session = new SessionManager(testKey);
  const mockTokenData = { Authorization: 'Bearer abc123' };
 
  beforeEach(() => {
    jest.clearAllMocks();
  });
 
  test('store a token in stack', async () => {
    await session.setToken(mockTokenData);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(testKey, mockTokenData.Authorization);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });
 
  test('retrieve a token from stack', async () => {
    AsyncStorage.getItem.mockResolvedValue('Bearer abc123');
    const token = await session.getToken();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(testKey);
    expect(token).toBe('Bearer abc123');
  });
 
  test('clear a token from stack', async () => {
    await session.clearToken();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(testKey);
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
  });
 
  test('should return null when getToken throws an error', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('getItem failed'));
    const token = await session.getToken();
    expect(token).toBeNull();
  });
 
  test('should handle error when setToken fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.setItem.mockRejectedValue(new Error('setItem failed'));
    await session.setToken(mockTokenData);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error saving session token:'), expect.any(Error));
    consoleSpy.mockRestore();
  });
 
  test('should handle error when clearToken fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.removeItem.mockRejectedValue(new Error('removeItem failed'));
    await session.clearToken();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error clearing session token:'), expect.any(Error));
    consoleSpy.mockRestore();
  });
});