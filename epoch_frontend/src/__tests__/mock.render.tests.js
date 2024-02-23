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
import {getAllUserPosts} from "../services/post";
import {beforeEach, jest} from "@jest/globals";

global.XMLHttpRequest = jest.fn();
let mockOpen, mockSend, mockSetRequestHeader;

jest.mock("../services/user");
jest.mock("../services/post");

const mockUser = {
  name: "Test User",
  id: "123",
  username: "testuser",
  password: "password",
  created_at: "2022-01-01",
  bio: "This is a test user",
  profile_pic_id: "456",
};

const mockPost = {
    post_id: "123",
    profile_picture: "test.jpg",
    caption: "This is a test post",
    release: "2022-01-01",
    created_at: "2022-01-01",
    file: "test.jpg",
    file_type: "image/jpeg",
}

const username = v4();
const password = v4() + "A1!";

describe('Render Pages', () => {
        beforeEach(() => {
        mockOpen = jest.fn();
        mockSend = jest.fn();
        mockSetRequestHeader = jest.fn();

        global.XMLHttpRequest.mockReturnValue({
            open: mockOpen,
            send: mockSend,
            setRequestHeader: mockSetRequestHeader,
            readyState: 4,
            status: 200,
            onreadystatechange: jest.fn(),
            ontimeout: null,
            onerror: null,
            onabort: null
        });

        document.cookie = 'epoch_session_id=test_session_id';
    });

    test("displays user information on profile page", async () => {
        getUserInfo.mockResolvedValue(mockUser);
        getUsernameInfo.mockResolvedValue(mockUser);
        getAllUserPosts.mockResolvedValue([mockPost]);


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
        getAllUserPosts.mockResolvedValue([mockPost]);

        await act(async () => {
          render(
            <BrowserRouter>
                <UserProvider>
                    <Home />
                </UserProvider>
            </BrowserRouter>
          );
        });

        await waitFor(() => {expect(screen.getByTestId('home-feed')).toBeInTheDocument();});

    });

    test("App lands on login home page", async () => {
        getUserInfo.mockResolvedValue(mockUser);
        getAllUserPosts.mockResolvedValue([mockPost]);

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => {expect(screen.getByTestId('home-feed')).toBeInTheDocument(); });
    });
});


