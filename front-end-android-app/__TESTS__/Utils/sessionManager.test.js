jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn().mockResolvedValue('mockToken'),
  removeItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import SessionManager from '../../src/utils/SessionManager';

describe('SessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SessionManager.key = 'testKey'; // static property used by static methods
  });

  // ✅ Test constructor
  test('constructor sets key', () => {
    const session = new SessionManager('myKey');
    expect(session.key).toBe('myKey');
  });

  // ✅ Test setToken happy path
  test('setToken stores the token', async () => {
    const data = { Authorization: 'Bearer abc123' };
    await SessionManager.setToken(data);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('testKey', 'Bearer abc123');
  });

  // ✅ Test getToken happy path
  test('getToken retrieves the token', async () => {
    const token = await SessionManager.getToken();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('testKey');
    expect(token).toBe('mockToken');
  });

  // ✅ Test clearToken happy path
  test('clearToken removes the token', async () => {
    await SessionManager.clearToken();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('testKey');
  });

  // ❌ Error path: getToken fails
  test('getToken returns null if AsyncStorage.getItem throws', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'));
    const token = await SessionManager.getToken();
    expect(token).toBeNull();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  // ❌ Error path: setToken fails
  test('setToken logs error if AsyncStorage.setItem throws', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('fail'));
    await SessionManager.setToken({ Authorization: 'Bearer abc123' });
    expect(spy).toHaveBeenCalledWith(
      'Error saving session token:',
      expect.any(Error)
    );
    spy.mockRestore();
  });

  // ❌ Error path: clearToken fails
  test('clearToken logs error if AsyncStorage.removeItem throws', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.removeItem.mockRejectedValueOnce(new Error('fail'));
    await SessionManager.clearToken();
    expect(spy).toHaveBeenCalledWith(
      'Error clearing session token:',
      expect.any(Error)
    );
    spy.mockRestore();
  });
});