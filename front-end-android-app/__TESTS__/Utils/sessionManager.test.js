jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn().mockResolvedValue('mockToken'),
  removeItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import SessionManager from '../../src/utils/SessionManager';

describe('SessionManager', () => {
  let session
  beforeEach(() => {
    jest.clearAllMocks();
    session = new SessionManager('testKey')
  });

  // ✅ Test constructor
  test('constructor sets key', () => {
    expect(session.key).toBe('testKey');
  });

  // ✅ Test setToken happy path
  test('setToken stores the token', async () => {
    const data = 'Bearer abc123' 
    await session.setToken(data);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('testKey', 'Bearer abc123');
  });

  // ✅ Test getToken happy path
  test('getToken retrieves the token', async () => {
    const token = await session.getToken();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('testKey');
    expect(token).toBe('mockToken');
  });

  // ✅ Test clearToken happy path
  test('clearToken removes the token', async () => {
    await session.clearToken();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('testKey');
  });

  // ❌ Error path: getToken fails
  test('getToken returns null if AsyncStorage.getItem throws', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'));
    const token = await session.getToken();
    expect(token).toBeNull();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  // ❌ Error path: setToken fails
  test('setToken logs error if AsyncStorage.setItem throws', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('fail'));
    await session.setToken({ Authorization: 'Bearer abc123' });
    expect(spy).toHaveBeenCalledWith(
      'Error saving testKey:',
      expect.any(Error)
    );
    spy.mockRestore();
  });

  // ❌ Error path: clearToken fails
  test('clearToken logs error if AsyncStorage.removeItem throws', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.removeItem.mockRejectedValueOnce(new Error('fail'));
    await session.clearToken();
    expect(spy).toHaveBeenCalledWith(
      'Error clearing testKey token:',
      expect.any(Error)
    );
    spy.mockRestore();
  });
});