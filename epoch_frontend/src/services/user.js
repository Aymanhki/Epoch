
function tryLogin(username, password) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open("POST", `${serverUrl}/api/login/`, true); // Login the user
        xhr.setRequestHeader("Content-Type", "application/json"); // Set the request header
        xhr.withCredentials = true;
        xhr.timeout = 10000;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }


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
        xhr.timeout = 10000;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const userData = JSON.parse(xhr.responseText);

                   // if (userData.profile_pic_data) {
                   //      const profilePicData = userData.profile_pic_data;
                   //      userData.profile_pic_data = `data:image/png;base64,${profilePicData}`;
                   //  }

                    resolve(userData);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.send(JSON.stringify({session_id: session_id}));
    });
}

function getUsernameInfo(username) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/user/`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('User-Id', username)
        xhr.withCredentials = true;
        xhr.timeout = 10000;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const userData = JSON.parse(xhr.responseText);

                    // if (userData.profile_pic_data) {
                    //     const profilePicData = userData.profile_pic_data;
                    //     userData.profile_pic_data = `data:image/png;base64,${profilePicData}`;
                    // }

                    resolve(userData);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        const toSend = JSON.stringify({username: username});
        xhr.send(toSend);
    });
}

function removeSessionCookie() {
    document.cookie = "epoch_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function uploadProfilePic(file, userId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('POST', `${serverUrl}/api/upload/profile/1/`, true);
        xhr.withCredentials = true;
        xhr.timeout = 100000;

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                }
                else
                {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    }
                    else
                    {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.ontimeout = function () {
            reject("Request timed out");
        };

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        const reader = new FileReader();

        reader.onload = () => {
            const fileName = file.name;
            const fileType = file.type;
            const fileData = reader.result.split(',')[1];
            const toSend = JSON.stringify({fileName: fileName, fileType: fileType, fileData: fileData, userId: userId});
            xhr.send(toSend);
        };

        reader.readAsDataURL(file);
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
        xhr.timeout = 10000;

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

        xhr.send(JSON.stringify(userObject));
    });
}

function deleteUser(userId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('DELETE', `${serverUrl}/api/delete/userId/`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;
        xhr.timeout = 10000;



        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(true);
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }


        xhr.send(JSON.stringify({userId: userId}));
    });
}


module.exports = {tryLogin, getUserInfo, removeSessionCookie, uploadProfilePic, registerUser, deleteUser, getUsernameInfo};