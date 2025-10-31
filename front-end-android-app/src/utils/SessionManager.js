import AsyncStorage from '@react-native-async-storage/async-storage';
 
class SessionManager {
 
    constructor(key) {
       this.key = key
    }
 
    static async setToken(data) {
      try {
        await AsyncStorage.setItem(this.key, data.Authorization);
      } catch (error) {
        console.error('Error saving session token:', error);
      }
    }
   
 
    static async getToken() {
      try {
        const sessionToken = await AsyncStorage.getItem(this.key);
        return sessionToken;
      } catch (error) {
        console.error('Error retrieving session token:', error);
        return null;
      }
    }
   
 
    static async clearToken() {
      try {
        await AsyncStorage.removeItem(this.key);
        console.log('Session token cleared.');
      } catch (error) {
        console.error('Error clearing session token:', error);
      }
    }
  }
   
  export default SessionManager;