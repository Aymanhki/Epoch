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
        http.open("GET", `${serverUrl}/api/follow/accountList/`, true);
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
                        reject("Connection refused: The server is not running or unreachable while getting account list");
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

async function getFollowingList(targetAcc) {
    const session_id = getCookie('epoch_session_id');

    if (!session_id) {
        return;
    }
    return new Promise((resolve, reject) => {
        var http = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        http.open("POST", `${serverUrl}/api/follow/followingList/`, true);
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
                        reject(http.statusText + "Connection refused: The server is not running or unreachable while getting following list");
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

        http.send(JSON.stringify({session_id: session_id, target: targetAcc}));
    });

}

function getFollowerList(targetAcc) {
    const session_id = getCookie('epoch_session_id');

    if (!session_id) {
        return;
    }
    return new Promise((resolve, reject) => {
        var http = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        http.open("POST", `${serverUrl}/api/follow/followerList/`, true);
        http.setRequestHeader("Content-Type", "application/json");
        http.withCredentials = true;
        http.timeout = 10000;

        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                if (http.status === 200) {
                    const followerList = JSON.parse(http.responseText);
                    resolve(followerList);
                } else {
                    if (http.status !== 0) {
                        reject(http.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable while getting follower list");
                    }
                }
            }
        };

        http.ontimeout = function () {
            reject("Request timed out");
        }

        http.onerror = function () {
            reject("An error occurred sending follower list request");
        }

        http.onabort = function () {
            reject("follower List Request aborted");
        }

        http.send(JSON.stringify({session_id: session_id, target: targetAcc}));
    });

}

async function fillUserList() {
    var users = await getAccountList();
    var following = await getFollowingList("self");

    for (var i in users) {
        users[i].isFollowing = false;
    }
    for (var k in following) {
        for (var j in users) {
            if (users[j].user_id === following[k].following_id) {
                users[j].isFollowing = true;
            }
        }
    }
    if (users.length > 0) {
        users.sort(function (a, b) {
            return b.isFollowing - a.isFollowing;
        });
    }
    return users;
}

async function profileFollowNetwork(accountID) {

    var followers = [];
    var following = [];

    try {
        following = await getFollowingList(accountID);

    }
    catch (e) {
        console.log(e);

    }

    try {
        followers = await getFollowerList(accountID);
    }
    catch (e) {
        console.log(e);
    }

    var followerCount = followers.length;
    var followingCount = following.length;

    return [followingCount, followerCount, following, followers];
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
        http.open("POST", `${serverUrl}/api/follow/follow/`, true);
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
                        reject("Connection refused: The server is not running or unreachable while following account");
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
        http.open("POST", `${serverUrl}/api/follow/unfollow/`, true);
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
                        reject("Connection refused: The server is not running or unreachable while unfollowing account");
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

module.exports = {followAccount, unfollowAccount, fillUserList, getFollowingList, profileFollowNetwork, getFollowerList, getAccountList};