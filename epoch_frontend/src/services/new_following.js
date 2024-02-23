function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getAccountList() {
    const session_id = getCookie('epoch_session_id');
    if (!session_id) {
        return;
    }
    return new Promise((resolve, reject) => {
        var http = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        http.open("GET",`${serverUrl}/api/follow/accountList/`, true );
        http.setRequestHeader("Content-Type", "application/json");
        http.withCredentials = true;
        http.timeout = 10000;

        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                if (http.status === 200) {
                    const userList = JSON.parse(http.responseText);
                    resolve(userList);
                } else {
                    if (http.status !== 0) {
                        reject(http.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        http.ontimeout = function () {
            reject("Request timed out");
        }

        http.onerror = function () {
            reject("An error occurred sending account list request");
        }

        http.onabort = function () {
            reject("Account List Request aborted");
        }

        http.send(JSON.stringify({session_id: "f743d751-d2a4-4db8-af0b-bce739410157"}));
    });
}

function getFollowingList() {
    const session_id = getCookie('epoch_session_id');
    if (!session_id) {
        return;
    }
    return new Promise((resolve, reject) => {
        var http = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        http.open("GET",`${serverUrl}/api/follow/followingList/`, true );
        http.setRequestHeader("Content-Type", "application/json");
        http.withCredentials = true;
        http.timeout = 10000;

        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                if (http.status === 200) {
                    const followingList = JSON.parse(http.responseText);
                    resolve(followingList);
                } else {
                    if (http.status !== 0) {
                        reject(http.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        };

        http.ontimeout = function () {
            reject("Request timed out");
        }

        http.onerror = function () {
            reject("An error occurred sending following list request");
        }

        http.onabort = function () {
            reject("following List Request aborted");
        }

        http.send(JSON.stringify({session_id: "f743d751-d2a4-4db8-af0b-bce739410157"}));
    });

}

function followAccount(target) {
    const session_id = getCookie('epoch_session_id');
    if (!session_id) {
        return;
    }

}

function unfollowAccount(target) {
    const session_id = getCookie('epoch_session_id');
    if (!session_id) {
        return;
    }

}

module.exports = {getAccountList, getFollowingList, followAccount, unfollowAccount}