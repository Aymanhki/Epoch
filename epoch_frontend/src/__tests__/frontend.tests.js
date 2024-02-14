import React from 'react';
import { screen, act, render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Router from "../modules/Router.js";
import { v4 } from 'uuid';


const DEFAULT_WAIT_TIME = 5000;


describe('Router Tests', () => {
    test('Router Lands on login', async () => {

        await act(async () => {
            const {app} = render(<Router/>);
        });

        expect(screen.getByTestId("login-button")).toBeInTheDocument();
        expect(screen.getByTestId("login-form")).toBeInTheDocument();

    });

    test('Router directs to register page on click', async () => {
        await act(async () => {
            const {app} = render(<Router/>);
        });

        const registerHereLink = screen.getByText("Register here");
        fireEvent.click(registerHereLink)
        expect(screen.getByTestId("register-button")).toBeInTheDocument();
        expect(screen.getByTestId("register-form")).toBeInTheDocument();
        expect(screen.getByText("Log in here"))
    })

    test('Router directs to login page on click', async () => {
        await act(async () => {
            const {app} = render(<Router/>);
        });

        const logInHereLink = screen.getByText("Log in here");
        fireEvent.click(logInHereLink)

        await waitFor(() => {
            expect(screen.getByTestId("login-button")).toBeInTheDocument();
            expect(screen.getByTestId("login-form")).toBeInTheDocument();
        }, { timeout: DEFAULT_WAIT_TIME });
    })
});

describe('Input Field Validation', () => {
    test('Username & Password can not be empty on login', async () => {
        await act(async () => {
            const {app} = render(<Router/>);
        });

        const submitButton = screen.getByTestId("login-button");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("* Username field cannot be empty")).toBeInTheDocument();
            expect(screen.getByText("* Password field cannot be empty")).toBeInTheDocument();
        }, { timeout: DEFAULT_WAIT_TIME });
    });

    test('Name, Username, and Password must meet input validation', async () => {
        await act(async () => {
            const {app} = render(<Router/>);
        });

        const registerHereLink = screen.getByText("Register here");
        fireEvent.click(registerHereLink)

        const submitButton = screen.getByTestId("register-button");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("* Name must be between 1 and 254 characters")).toBeInTheDocument();
            expect(screen.getByText("* Username must be between 1 and 50 characters and can only contain letters, numbers, and the following special characters: . _ @ $ -")).toBeInTheDocument();
            expect(screen.getByText("* Password must be between 1 and 254 characters, at least one uppercase letter, one lowercase letter, one number, and one special character")).toBeInTheDocument();
        }, { timeout: DEFAULT_WAIT_TIME });
    });

    test('Meaningful error messages are displayed on login when server is down', async () => {
        const originalError = console.error;
        console.error = jest.fn();

        await act(async () => {
            const {app} = render(<Router/>);
        });

        const logInHereLink = screen.getByText("Log in here");
        fireEvent.click(logInHereLink)

        await waitFor(() => {
            expect(screen.getByTestId("login-button")).toBeInTheDocument();
            expect(screen.getByTestId("login-form")).toBeInTheDocument();
        }, { timeout: DEFAULT_WAIT_TIME });

        // type a username and password using uuid
        const username = v4();
        const password = v4();

        const usernameInput = screen.getByTestId("username-input-field");
        fireEvent.change(usernameInput, { target: { value: username } });

        const passwordInput = screen.getByTestId("password-input-field");
        fireEvent.change(passwordInput, { target: { value: password } });

        const submitButton = screen.getByTestId("login-button");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Connection refused: The server is not running or unreachable")).toBeInTheDocument();
        });

        console.error = originalError;
    });

    test('Meaningful error messages are displayed on register when server is down', async () => {
        const originalError = console.error;
        console.error = jest.fn();

        await act(async () => {
            const {app} = render(<Router/>);
        });

        const registerHereLink = screen.getByText("Register here");
        fireEvent.click(registerHereLink)

        await waitFor(() => {
            expect(screen.getByTestId("register-button")).toBeInTheDocument();
            expect(screen.getByTestId("register-form")).toBeInTheDocument();
        }, { timeout: DEFAULT_WAIT_TIME });

        // type a username and password using uuid
        const name = v4();
        const username = v4();
        const password = v4() + "A1!";

        const nameInput = screen.getByTestId("name-input-field");
        fireEvent.change(nameInput, { target: { value: name } });

        const usernameInput = screen.getByTestId("username-input-field");
        fireEvent.change(usernameInput, { target: { value: username } });

        const passwordInput = screen.getByTestId("password-input-field");
        fireEvent.change(passwordInput, { target: { value: password } });

        const submitButton = screen.getByTestId("register-button");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Connection refused: The server is not running or unreachable")).toBeInTheDocument();
        });

        console.error = originalError;
    });
});


