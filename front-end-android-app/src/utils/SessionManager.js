import AsyncStorage from '@react-native-async-storage/async-storage';
 
class SessionManager {
 
    constructor(key) {
       this.key = key
    }
 
    async setToken(data) {
      try {
        await AsyncStorage.setItem(this.key, data);
      } catch (error) {
        console.error(`Error saving ${this.key}`, error);
      }
    }
   
 
    async getToken() {
      try {
        const sessionToken = await AsyncStorage.getItem(this.key);
        return sessionToken;
      } catch (error) {
        console.error(`Error retrieving ${this.key}`, error);
        return null;
      }
    }
   
 
    async clearToken() {
      try {
        await AsyncStorage.removeItem(this.key);
        console.log(`${this.key} token cleared.`);
      } catch (error) {
        return
      }
    }
  }
   
  export default SessionManager;