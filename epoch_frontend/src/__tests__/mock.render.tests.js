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
import {getAllUserPosts, getFollowedUsersPost} from "../services/post";
import {profileFollowNetwork, getFollowingList, getFollowerList } from "../services/following";
import {beforeEach, jest, afterEach} from "@jest/globals";

global.XMLHttpRequest = jest.fn();
let mockOpen, mockSend, mockSetRequestHeader;
let originalError = console.error;


jest.mock("../services/user");
jest.mock("../services/post");
jest.mock("../services/following");

const mockUser = {
    name: "Test User",
    id: "123",
    username: "testuser",
    password: "password",
    created_at: "2022-01-01",
    bio: "This is a test user",
    profile_pic_id: "456",
    profile_picture_type: "test",
    profile_picture_name: "test",
    profile_picture_data: "test",
    profile_pic_type: "test",
    profile_pic_name: "test",
    profile_pic_data: "test",
    profile_pic: "test",
};

const mockPost = {
    post_id: "123",
    profile_picture: "test.jpg",
    caption: "This is a test post",
    release: "2022-01-01",
    created_at: "2022-01-01",
    file: "test.jpg",
    file_type: "image/jpeg",
    favorited_by: [],
    favorited_by_count: 0,
    favorited_by_usernames: [],
    votes_by_usernames: [],
}


const username = v4().substring(0, 20);
const password = "ThisIsAValidPassword1!";

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
        originalError = console.error;
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = originalError;
    });

    test("displays user information on profile page", async () => {
        getUserInfo.mockResolvedValue(mockUser);
        getUsernameInfo.mockResolvedValue(mockUser);
        getAllUserPosts.mockResolvedValue([]);
        getFollowingList.mockResolvedValue([]);
        getFollowerList.mockResolvedValue([]);
        profileFollowNetwork.mockResolvedValue([[], [], 0, 0]);


        await act(async () => {
            render(
                <BrowserRouter>
                    <UserProvider>
                        <Profile/>
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
        getAllUserPosts.mockResolvedValue([]);
        getFollowedUsersPost.mockResolvedValue([]);

        await act(async () => {
            render(
                <BrowserRouter>
                    <UserProvider>
                        <Home/>
                    </UserProvider>
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId('home-feed')).toBeInTheDocument();
        });

    });

    test("App lands on login home page", async () => {
        getUserInfo.mockResolvedValue(mockUser);
        getAllUserPosts.mockResolvedValue([]);
        getFollowedUsersPost.mockResolvedValue([]);

        await act(async () => {
            render(<App/>);
        });

        await waitFor(() => {
            expect(screen.getByTestId('home-feed')).toBeInTheDocument();
        });
    });
});


