import SessionManager from "../utils/SessionManager";

class UserSignout {
    constructor() {
        
    }

    static async signoutUser(navigation){
        const usernameManager = new SessionManager('Username')
        const tokenManager = new SessionManager('JWT_TOKEN')

        // we only need to async the token because that is security
        // the other values can be cleared when the system has time
        await usernameManager.clearToken()
        tokenManager.clearToken()

        navigation.reset({index: 0, routes: [{name: 'SignIn'}]})
    }
}

export default UserSignout