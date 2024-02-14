import {getUserInfo, tryLogin, registerUser, deleteUser, uploadProfilePic} from "../services/user";
import {act, render, screen, waitFor} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import Profile from "../pages/profile";
import Home from "../pages/home";
import App from "../App";
import React from "react";
import '@testing-library/jest-dom';
import {v4} from "uuid";

jest.mock("../services/user");

const mockUser = {
  name: "Test User",
  id: "123",
  username: "testuser",
  password: "password",
  created_at: "2022-01-01",
  bio: "This is a test user",
  profile_pic_id: "456",
};
const username = v4();
const password = v4() + "A1!";

describe('Render Pages', () => {

    test("displays user information on profile page", async () => {
        getUserInfo.mockResolvedValue(mockUser);

        await act(async () => {
          render(
            <BrowserRouter>
              <Profile />
            </BrowserRouter>
          );
        });

        await waitFor(() => {
            const allNameElements = screen.getAllByText(new RegExp(mockUser.name, 'i'));
            allNameElements.forEach((element) => {
              expect(element).toBeInTheDocument();
            });
        });
    });

    test("displays user information on home page", async () => {
        getUserInfo.mockResolvedValue(mockUser);

        await act(async () => {
          render(
            <BrowserRouter>
              <Home />
            </BrowserRouter>
          );
        });

        await waitFor(() => {
            const allNameElements = screen.getAllByText(new RegExp(mockUser.name, 'i'));
            allNameElements.forEach((element) => {
              expect(element).toBeInTheDocument();
            });
        });
    });

    test("App lands on login home page", async () => {
        getUserInfo.mockResolvedValue(mockUser);

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => {
            const allNameElements = screen.getAllByText(new RegExp(mockUser.name, 'i'));
            allNameElements.forEach((element) => {
                expect(element).toBeInTheDocument();
            });
        });
    });
});




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