function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function newPost(postObject) {
    return new Promise((resolve, reject) => {

        const session_id = getCookie('epoch_session_id');

        if (!session_id) {
            reject('No session cookie found');
            return;
        }

        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('POST', `${serverUrl}/api/post/`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${session_id}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

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


        if (postObject.file) {
            const reader = new FileReader();

            reader.onload = function () {
                postObject.file = reader.result.split(',')[1];
                xhr.send(JSON.stringify(postObject));
            }

            reader.readAsDataURL(postObject.file);
            return;
        }

        xhr.send(JSON.stringify(postObject));
    });
};

function getAllUserPosts(userId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/user/download-post/`, true);
        xhr.setRequestHeader('User-Id', userId);
        xhr.withCredentials = true;
        xhr.timeout = 10000000;

        xhr.ontimeout = function () {
            reject("Request timed out");
        }

        xhr.onerror = function () {
            reject("An error occurred");
        }

        xhr.onabort = function () {
            reject("Request aborted");
        }

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

        xhr.send();
    });
}

module.exports = {newPost, getAllUserPosts}