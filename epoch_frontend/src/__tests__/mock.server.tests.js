import {getUserInfo, tryLogin, registerUser, deleteUser, uploadProfilePic, removeSessionCookie} from "../services/user";
import {beforeEach, jest} from "@jest/globals";

global.XMLHttpRequest = jest.fn();
let mockOpen, mockSend, mockSetRequestHeader;

describe('User Actions', () => {
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

    test('Correct request for login', async () => {
        const username = 'testuser';
        const password = 'password';

        tryLogin(username, password).then(result => {
            expect(mockOpen).toHaveBeenCalledWith('POST', 'http://localhost:8080/api/login/', true);
            expect(mockSetRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockSend).toHaveBeenCalledWith(JSON.stringify({username, password}));
            expect(result).toBe(true);
            done();
        });
    });

    test('Correct request for register', async () => {
        const userObject = {
            name: 'Test User',
            username: 'testuser',
            password: 'password',
            bio: 'This is a test user'
        };

        registerUser(userObject).then(result => {
            expect(mockOpen).toHaveBeenCalledWith('POST', 'http://localhost:8080/api/register/', true);
            expect(mockSetRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockSend).toHaveBeenCalledWith(JSON.stringify(userObject));
            expect(result).toBe(true);
            done();
        });
    });

    test('Correct request for user info', async () => {
        getUserInfo().then(result => {
            expect(mockOpen).toHaveBeenCalledWith('GET', 'http://localhost:8080/api/login/', true);
            expect(mockSetRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockSend).toHaveBeenCalledWith(JSON.stringify({session_id: 'test_session_id'}));
            expect(result).toBeTruthy();
            done();
        })
    });

    test('Correct request for delete user', async () => {
        const userId = '123';

        deleteUser(userId).then(result => {
            expect(mockOpen).toHaveBeenCalledWith('DELETE', 'http://localhost:8080/api/user/', true);
            expect(mockSetRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockSend).toHaveBeenCalledWith(JSON.stringify({id: userId}));
            expect(result).toBe(true);
            done();
        });
    });

    test('Correct request for upload profile pic', async () => {
        const file = new File([''], 'test.jpg', {type: 'image/jpeg'});
        const userId = '123';

        uploadProfilePic(file, userId).then(result => {
            expect(mockOpen).toHaveBeenCalledWith('POST', 'http://localhost:8080/api/upload/profile/1/', true);
            expect(mockSetRequestHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
            expect(mockSetRequestHeader).toHaveBeenCalledWith('File-Name', 'test.jpg');
            expect(mockSetRequestHeader).toHaveBeenCalledWith('User-Id', userId);
            expect(mockSend).toHaveBeenCalledWith(expect.any(ArrayBuffer));
            expect(result).toBe(true);
            done();
        });
    });

    test('User can remove session cookie', async () => {
        removeSessionCookie();
        expect(document.cookie).toBe("");
    });
});

describe('Server Failures', () => {
    const file = new File([''], 'test.jpg', {type: 'image/jpeg'});
    const username = 'testuser';
    const password = 'password';
    const userId = '123';

    const userObject = {
        name: 'Test User',
        username: 'testuser',
        password: 'password',
        bio: 'This is a test user'
    };

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
            ontimeout: jest.fn(),
            onerror: null,
            onabort: null
        });

        document.cookie = 'epoch_session_id=test_session_id';
    });

    test('User login triggers timeout', async () => {
        tryLogin(username, password).catch(error => {
            expect(error).toBe('Request timed out');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.ontimeout();
    });

    test('User login triggers error', async () => {
        tryLogin(username, password).catch(error => {
            expect(error).toBe('An error occurred');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onerror();
    });

    test('User login triggers abort', async () => {
        tryLogin(username, password).catch(error => {
            expect(error).toBe('Request aborted');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onabort();
    });

    test('Register triggers timeout', async () => {
        registerUser(userObject).catch(error => {
            expect(error).toBe('Request timed out');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.ontimeout();
    });

    test('Register triggers error', async () => {
        registerUser(userObject).catch(error => {
            expect(error).toBe('An error occurred');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onerror();
    });

    test('Register triggers abort', async () => {
        registerUser(userObject).catch(error => {
            expect(error).toBe('Request aborted');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onabort();
    });

    test('Get user info triggers timeout', async () => {
        getUserInfo().catch(error => {
            expect(error).toBe('Request timed out');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.ontimeout();
    });

    test('Get user info triggers error', async () => {
        getUserInfo().catch(error => {
            expect(error).toBe('An error occurred');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onerror();
    });

    test('Get user info triggers abort', async () => {
        getUserInfo().catch(error => {
            expect(error).toBe('Request aborted');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onabort();
    });

    test('Delete user triggers timeout', async () => {
        deleteUser(userId).catch(error => {
            expect(error).toBe('Request timed out');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.ontimeout();
    });

    test('Delete user triggers error', async () => {
        deleteUser(userId).catch(error => {
            expect(error).toBe('An error occurred');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onerror();
    });

    test('Delete user triggers abort', async () => {
        deleteUser(userId).catch(error => {
            expect(error).toBe('Request aborted');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onabort();
    });

    test('Upload profile pic triggers timeout', async () => {
        uploadProfilePic(file, userId).catch(error => {
            expect(error).toBe('Request timed out');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.ontimeout();
    });

    test('Upload profile pic triggers error', async () => {
        uploadProfilePic(file, userId).catch(error => {
            expect(error).toBe('An error occurred');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onerror();
    });

    test('Upload profile pic triggers abort', async () => {
        uploadProfilePic(file, userId).catch(error => {
            expect(error).toBe('Request aborted');
        });

        const xhr = new global.XMLHttpRequest();
        xhr.onabort();
    });

    test('Can\'t user info without session cookie', async () => {
        document.cookie = '';
        getUserInfo().catch(error => {
            expect(error).toBe('No session cookie found');
        });
    });
});