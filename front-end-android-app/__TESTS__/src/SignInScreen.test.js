import React from 'react';
import { Alert } from 'react-native';
import FetchHelper from '../../src/utils/fetchHelper';
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import SignInScreen from '../../src/screens/SignInScreen';
jest.mock("../../src/utils/fetchHelper", () => ({
    makeRequest: jest.fn(), 
}));



describe("SignInScreen", () => {
    beforeEach(()=>{
        jest.clearAllMocks();
        global.fetch = jest.fn(); // reset fetch for each test
        global.alert = jest.fn(); // reset alert for each test
        jest.spyOn(Alert, 'alert').mockImplementation(() => {}); // mock it safely
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
    test('shows error when username is too short', async () => {
        const { getByTestId, getByPlaceholderText } = render(<SignInScreen />);
        fireEvent.changeText(getByPlaceholderText('Username'), 'ab'); // too short
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByTestId('loginButton'));

        await waitFor(() => {
        expect(screen.getByText("Username must be atleast 3 characters long.")).toBeTruthy();
        });
    });

    test('shows error when password is too short', async () => {
        const { getByTestId, getByPlaceholderText } = render(<SignInScreen />);
        fireEvent.changeText(getByPlaceholderText('Username'), 'legend27');
        fireEvent.changeText(getByPlaceholderText('Password'), 'short'); // < 8
        fireEvent.press(getByTestId('loginButton'));

        await waitFor(() => {
            expect(screen.getByText("Password must be at least 8 characters.")).toBeTruthy();
        });
    });

    test('navigates to SignUp when Sign Up link is pressed', () => {
        const mockNavigate = jest.fn();
        const navigation = { navigate: mockNavigate };

        const { getByText } = render(<SignInScreen navigation={navigation} />);
        fireEvent.press(getByText("Don't have an account? Sign Up"));

        expect(mockNavigate).toHaveBeenCalledWith("SignUp");
    });
    test('shows alert when network error occurs', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network down'));
        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

        const { getByTestId, getByPlaceholderText } = render(<SignInScreen />);
        fireEvent.changeText(getByPlaceholderText('Username'), 'legend27');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByTestId('loginButton'));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Network error occurred');
        });
    });


    test('shows Successful login alert after recieving response', async ()=> { 
        //simulate mock successful login
        global.fetch = jest.fn();
        global.alert = jest.fn();
       FetchHelper.makeRequest.mockResolvedValueOnce({
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
            expect(Alert.alert).toHaveBeenCalledWith('Successful Login', 'Welcome Back Driver'); 
        });
                
    });
    test('shows Failed login alert after recieving response', async ()=> { 
        global.fetch = jest.fn();
        global.alert = jest.fn();
        FetchHelper.makeRequest.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ message: "Invalid Username or Password" })
        });
        const {getByTestId, getByPlaceholderText} = render(<SignInScreen />);

        fireEvent.changeText(getByPlaceholderText('Username'), "legend27");
        fireEvent.changeText(getByPlaceholderText('Password'), "pass1222");

        const loginButton = getByTestId('loginButton'); 
        fireEvent.press(loginButton); 

        await screen.findByText("LOGIN"); 
        expect(Alert.alert).toHaveBeenCalledWith("Failed Login", "Invalid Username or Password"); 
                
    });
    test('shows Successful login alert with server message is missing', async ()=> { 
        //simulate mock successful login
        global.fetch = jest.fn();
        global.alert = jest.fn();
       FetchHelper.makeRequest.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({token: 'fakeToken Bearer'}),//message is missing
        });
        const {getByTestId, getByPlaceholderText} = render(<SignInScreen />);

        fireEvent.changeText(getByPlaceholderText('Username'), "legend27");
        fireEvent.changeText(getByPlaceholderText('Password'), "pass1234");

        const loginButton = getByTestId('loginButton'); 
        fireEvent.press(loginButton); 

        await waitFor(()=>{
            expect(Alert.alert).toHaveBeenCalledWith('Successful Login', 'Welcome Back Driver'); 
        });
    });
    test('does not crash when navigation is missing navigation function', () => {
        const missingNavigation = {}; 
        const {getByText} = render(<SignInScreen navigation={missingNavigation} />); 
        fireEvent.press(getByText("Don't have an account? Sign Up"));
        expect(getByText("Don't have an account? Sign Up")).toBeTruthy(); 
    })
    test("ensure sanitation for username", () => {
        const {getByPlaceholderText} = render(<SignInScreen/>);
        const input = getByPlaceholderText("Username");  

        fireEvent.changeText(input, "something!@#"); 
        expect(input.props.value).toBe("something");
    });
});