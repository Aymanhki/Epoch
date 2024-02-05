
function tryLogin(username, password) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;

        xhr.open("POST", `${serverUrl}/api/login/`, true); // Login the user
        xhr.setRequestHeader("Content-Type", "application/json"); // Set the request header
        xhr.withCredentials = true;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log("Login successful");
                    resolve(true);
                } else {
                    reject(xhr.statusText);
                }
            }
        };

        xhr.send(JSON.stringify({username: username, password: password})); // Send the request
    });
}


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getUserInfo() {
    return new Promise((resolve, reject) => {

        const session_id = getCookie('epoch_session_id');

        if (!session_id) {
            reject('No session cookie found');
            return;
        }

        var xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/login/`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const userData = JSON.parse(xhr.responseText);

                    // Check if profile picture data is available
                    if (userData.profile_pic_data) {
                        // Assuming profile_pic_data is a base64 encoded string
                        const profilePicData = userData.profile_pic_data;
                        userData.profile_pic_data = `data:image/png;base64,${profilePicData}`;
                    }

                    resolve(userData);
                } else {
                    reject(xhr.statusText);
                }
            }
        };

        xhr.send(JSON.stringify({session_id: session_id}));
    });
}

function removeSessionCookie() {
    document.cookie = "epoch_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function uploadFile(file, userId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;

        xhr.open('POST', `${serverUrl}/api/upload/`, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.setRequestHeader('File-Name', file.name);
        xhr.setRequestHeader('User-Id', userId);
        xhr.withCredentials = true;
        xhr.timeout = 100000;

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                }
                else
                {
                    reject(xhr.statusText);
                }
            }
        };

        xhr.ontimeout = function () {
            reject("Request timed out");
        };

        const reader = new FileReader();

        reader.onload = () => {
            const fileData = reader.result;

            xhr.send(fileData);
        };

        reader.readAsArrayBuffer(file);
    });
}

function registerUser(userObject) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;


        xhr.open('POST', `${serverUrl}/api/register/`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(xhr.statusText);
                }
            }
        };

        xhr.send(JSON.stringify(userObject));
    });
}

function deleteUser(userId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;

        xhr.open('DELETE', `${serverUrl}/api/delete/user/`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    reject(xhr.statusText);
                }
            }
        };

        xhr.send(JSON.stringify({userId: userId}));
    });
}


module.exports = {tryLogin, getUserInfo, removeSessionCookie, uploadFile, registerUser, deleteUser};