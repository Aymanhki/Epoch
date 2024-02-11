import React from 'react';
import { screen, act, render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Router from "../modules/Router";
import { v4 } from 'uuid';
import { spawn } from 'child_process';


const DEFAULT_ELEMENT_WAIT_TIME = 5000;


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
        }, { timeout: DEFAULT_ELEMENT_WAIT_TIME });
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
        }, { timeout: DEFAULT_ELEMENT_WAIT_TIME });
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
        }, { timeout: DEFAULT_ELEMENT_WAIT_TIME });
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
        }, { timeout: DEFAULT_ELEMENT_WAIT_TIME });

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
        }, { timeout: DEFAULT_ELEMENT_WAIT_TIME });

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

// describe('Registration and Login functionality', () => {
//     let serverProcess;
//
//     it('Starts the backend server', async () => {
//         const serverPath = require('path').resolve(__dirname, '..', '../../epoch_backend/main.py');
//         serverProcess = spawn('python3', [serverPath]);
//
//         serverProcess.stdout.on('data', data => {
//             console.log(`Server Log: ${data}`);
//         });
//
//     });
//
//     test('User can register', async () => {
//         await act(async () => {
//             const {app} = render(<Router/>);
//         });
//
//         const name = v4();
//         const username = v4();
//         const password = v4() + "A1!";
//
//         const nameInput = screen.getByTestId("name-input-field");
//         fireEvent.change(nameInput, { target: { value: name } });
//
//         const usernameInput = screen.getByTestId("username-input-field");
//         fireEvent.change(usernameInput, { target: { value: username } });
//
//         const passwordInput = screen.getByTestId("password-input-field");
//         fireEvent.change(passwordInput, { target: { value: password } });
//
//         const submitButton = screen.getByTestId("register-button");
//         fireEvent.click(submitButton);
//
//         await waitFor(() => {
//             expect(screen.getByText(name)).toBeInTheDocument();
//         });
//     });
//
//     it('Shuts down the backend server', async () => {
//         serverProcess.kill();
//     });
// });

// const {Builder} = require('selenium-webdriver');
// const express = require('express');
// const path = require('path');
// const {By, until} = require('selenium-webdriver');
// const MAX_WAIT_FUNCTION = 1000000;
// const MAX_WAIT_ELEMENT = 5000;
// const MAX_WAIT_QUIT = 10000;
//
// describe('Login Functionality', () => {
//     let driver;
//     let server;
//
//     const serverSetupPromise = new Promise((resolve, reject) => {
//         const app = express();
//         const port = 3000;
//         app.use(express.static(path.join(__dirname, '..', '..', 'build')));
//         app.get('*', (req, res) => {
//             res.sendFile(path.join(__dirname, '..', '..', 'build', 'index.html'));
//         });
//
//         server = app.listen(port, () => {
//             console.log(`Server is running on port ${port}`);
//             resolve();
//         });
//
//         server.on('error', (error) => {
//             reject(error);
//         });
//     });
//
//     beforeAll(async () => {
//         try {
//             await serverSetupPromise;
//             driver = new Builder().forBrowser('chrome').build();
//         } catch (error) {
//             console.error('Error setting up WebDriver:', error);
//         }
//     }, MAX_WAIT_FUNCTION);
//
//     afterAll(async () => {
//         try {
//             //await new Promise(resolve => setTimeout(resolve, MAX_WAIT_QUIT));
//             await driver.quit();
//             await server.close();
//         } catch (error) {
//             console.error('Error closing WebDriver:', error);
//         }
//     }, MAX_WAIT_FUNCTION);
//
//
//     test('User can log in', async () => {
//         try {
//             await driver.get('http://localhost:3000/epoch/login');
//             const usernameInput = await driver.wait(until.elementLocated(By.id('username')), MAX_WAIT_ELEMENT);
//             const passwordInput = await driver.wait(until.elementLocated(By.id('password')), MAX_WAIT_ELEMENT);
//             const submitButton = await driver.wait(driver.findElement(By.css("[type='submit']")), MAX_WAIT_ELEMENT);
//             await usernameInput.sendKeys('aymanhki');
//             await passwordInput.sendKeys('Hkibrahim@3');
//             await submitButton.click();
//
//         } catch (error) {
//             console.error('Error logging in:', error);
//         }
//     }, MAX_WAIT_FUNCTION);
// });

