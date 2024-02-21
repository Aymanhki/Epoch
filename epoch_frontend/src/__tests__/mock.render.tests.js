import {getUserInfo, tryLogin, registerUser, deleteUser, uploadProfilePic, getUsernameInfo} from "../services/user";
import {act, render, screen, waitFor} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import Profile from "../pages/profile";
import Home from "../pages/home";
import App from "../App";
import React from "react";
import '@testing-library/jest-dom';
import {v4} from "uuid";
import {UserProvider} from "../services/UserContext"


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
        getUsernameInfo.mockResolvedValue(mockUser);

        await act(async () => {
          render(
            <BrowserRouter>
                <UserProvider>
                    <Profile />
                </UserProvider>
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
                <UserProvider>
                    <Home />
                </UserProvider>
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

