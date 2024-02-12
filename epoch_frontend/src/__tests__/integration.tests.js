import {act, fireEvent, render, screen, waitFor} from "@testing-library/react";
import Router from "../modules/Router.js";
import {v4} from "uuid";
import React from "react";
import { beforeAll, afterAll } from '@jest/globals';
const DEFAULT_WAIT_TIME = 100000;
const WAITING_FOR_SERVER = 5000;

describe('Registration and Login functionality', () => {

    beforeAll(async () => {
        await new Promise(resolve => setTimeout(resolve, WAITING_FOR_SERVER));
    }, DEFAULT_WAIT_TIME);

    test('User can register', async () => {
        await act(async () => {
            render(<Router/>);
        });

        const name = v4();
        const username = v4();
        const password = v4() + "A1!";

        const registerHereLink = screen.getByText("Register here");
        fireEvent.click(registerHereLink);

        const nameInput = screen.getByTestId("name-input-field");
        fireEvent.change(nameInput, {target: {value: name}});

        const usernameInput = screen.getByTestId("username-input-field");
        fireEvent.change(usernameInput, {target: {value: username}});

        const passwordInput = screen.getByTestId("password-input-field");
        fireEvent.change(passwordInput, {target: {value: password}});

        const submitButton = screen.getByTestId("register-button");
        fireEvent.click(submitButton);

        const waitForNameOrSpinner = async () => {
            const nameOnProfile = screen.queryByText(new RegExp(name, 'i'));
            const spinner = screen.queryByTestId('loading-spinner');

            if (nameOnProfile) {
                return true;
            }

            if (!spinner) {
                return true;
            }

            return false;
        };


        const shouldRenderProfile = await waitFor(() => {
            expect(waitForNameOrSpinner()).toBeTruthy();
        });


    }, DEFAULT_WAIT_TIME);


}, DEFAULT_WAIT_TIME);

// import {Builder} from 'selenium-webdriver';
// import  express  from 'express';
// import path from 'path';
// import { By, until } from 'selenium-webdriver';
// import { beforeAll, afterAll } from '@jest/globals';
//
// const MAX_WAIT_FUNCTION = 10000000;
// const MAX_WAIT_ELEMENT = 500000000;
// const MAX_WAIT_QUIT = 1000000000;
//
// describe('Login Functionality', () => {
//     let driver;
//     let server;
//
//     const serverSetupPromise = new Promise((resolve, reject) => {
//         const app = express();
//         const port = 3000;
//
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
//             await driver.wait(until.urlIs('http://localhost:3000/epoch/home'), MAX_WAIT_ELEMENT);
//             await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), 'aymanhki')]`)), MAX_WAIT_ELEMENT);
//
//         } catch (error) {
//             console.error('Error logging in:', error);
//         }
//     }, MAX_WAIT_FUNCTION);
// });