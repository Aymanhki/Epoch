function addComment(commentObject) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('POST', `${serverUrl}/api/comments/post`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;
        xhr.timeout = 10000;

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

        xhr.send(JSON.stringify(commentObject));
    });
}


function deleteComment(commentId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('DELETE', `${serverUrl}/api/comments/delete`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.withCredentials = true;
        xhr.timeout = 10000;

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

        xhr.send(JSON.stringify({ commentId: commentId }));
    });
}


function getAllComments(postId) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/comments/get`, true);
        xhr.setRequestHeader('Post-Id', postId);
        xhr.withCredentials = true;
        xhr.timeout = 10000;

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

module.exports = { addComment, deleteComment, getAllComments };