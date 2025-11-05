import React from 'react';
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import SignInScreen from '../../src/screens/SignInScreen';



describe("SignInScreen", () => {
    beforeEach(()=>{
        jest.clearAllMocks();
        global.fetch = jest.fn(); // reset fetch for each test
        global.alert = jest.fn(); // reset alert for each test
    });

    test('renders Sign Up text correctly', () => { 
        render(<SignInScreen/>);
        expect(screen.getByText("Don't have an account? Sign Up")).toBeTruthy();        
    });

    test('renders user and password inputs', () => { 
        render(<SignInScreen/>);
        expect(screen.getByPlaceholderText("Username")).toBeTruthy(); 
        expect(screen.getByPlaceholderText("Password")).toBeTruthy(); 
    });

    test('shows strings when user does not input anything', async ()=> {
        const { getByTestId} = render(<SignInScreen />);
        const loginButton = getByTestId('loginButton'); 
        fireEvent.press(loginButton); 

        await waitFor(() => {//wait for re render
        expect(screen.getByText("Username is required.")).toBeTruthy();
        expect(screen.getByText("Password is required.")).toBeTruthy();
        });
    });
    test('shows Successful login alert after recieving response', async ()=> { 
        //simulate mock successful login
        global.fetch = jest.fn();
        global.alert = jest.fn();
        //const response = {}; 
       global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({message: 'Welcome Back Driver', token: 'fakeToken Bearer'}),
        });
        const {getByTestId, getByPlaceholderText} = render(<SignInScreen />);

        fireEvent.changeText(getByPlaceholderText('Username'), "legend27");
        fireEvent.changeText(getByPlaceholderText('Password'), "pass1234");

        const loginButton = getByTestId('loginButton'); 
        fireEvent.press(loginButton); 

        await waitFor(()=>{
            console.log('FETCH CALLS:', global.fetch.mock.calls);
            console.log('ALERT CALLS:', global.alert.mock.calls);
            expect(global.alert).toHaveBeenCalledWith('Successful Login', 'Welcome Back Driver'); 
        });
                
    });
    test('shows Failed login alert after recieving response', async ()=> { 
        global.fetch = jest.fn();
        global.alert = jest.fn();
        const response = {message: 'Invalid Username or Password'}; 
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({response}),
        });
        const {getByTestId, getByPlaceholderText} = render(<SignInScreen />);

        fireEvent.changeText(getByPlaceholderText('Username'), "legend27");
        fireEvent.changeText(getByPlaceholderText('Password'), "pass1222");

        const loginButton = getByTestId('loginButton'); 
        fireEvent.press(loginButton); 

        await screen.findByText("LOGIN"); 
        expect(global.alert).toHaveBeenCalledWith("Failed Login", "Invalid Username or Password"); 
                
    });
});