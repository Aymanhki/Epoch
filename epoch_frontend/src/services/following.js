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

        http.send(JSON.stringify({session_id: session_id}));
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

        http.send(JSON.stringify({session_id: session_id}));
    });

}

async function fillUserList() {
    var users = await getAccountList();
    var following = await getFollowingList();

    for (var i in users) {
        users[i].isFollowing = false;
    }
    for (var k in following) {
        for (var j in users) {
            if (users[j].user_id === following[k].following_id){
                users[j].isFollowing = true;
            }
        }
    }
    if(users.length>0){
        users.sort(function(a,b){
            return b.isFollowing - a.isFollowing;
        });
    }
    return users;
}

function followAccount(target) {
    const session_id = getCookie('epoch_session_id');
    if (!session_id) {
        return;
    }
    return new Promise((resolve, reject) => {
        var http = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        http.open("POST",`${serverUrl}/api/follow/follow/`, true );
        http.setRequestHeader("Content-Type", "application/json");
        http.withCredentials = true;
        http.timeout = 10000;

        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                if (http.status === 200) {
                    resolve(true);
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

        http.send(JSON.stringify({session_id: session_id, userToFollow: target}));
    });

}

function unfollowAccount(target) {
    const session_id = getCookie('epoch_session_id');
    if (!session_id) {
        return;
    }
    return new Promise((resolve, reject) => {
        var http = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        http.open("POST",`${serverUrl}/api/follow/unfollow/`, true );
        http.setRequestHeader("Content-Type", "application/json");
        http.withCredentials = true;
        http.timeout = 10000;

        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                if (http.status === 200) {
                    resolve(true);
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

        http.send(JSON.stringify({session_id: session_id, userToUnfollow: target}));
    });

}

module.exports = {followAccount, unfollowAccount, fillUserList, getFollowingList}