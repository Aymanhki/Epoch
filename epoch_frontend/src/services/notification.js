function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


function getUserNotifications(userId, limit, offset)
{
    return new Promise((resolve, reject) => {

        const session_id = getCookie('epoch_session_id');

        if (!session_id) {
            reject('No session cookie found');
            return;
        }

        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/notifications/user/`, true);
        xhr.setRequestHeader('User-Id', userId);
        xhr.setRequestHeader('Limit', limit);
        xhr.setRequestHeader('Offset', offset);
        xhr.setRequestHeader('Session-Id', session_id);
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

        xhr.onreadystatechange = () =>
        {
            if (xhr.readyState === 4)
            {
                if (xhr.status === 200)
                {
                    resolve(JSON.parse(xhr.responseText));
                }
                else
                {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        }


        xhr.send();
    });
}

function markNotificationRead(notificationId)
{
    return new Promise((resolve, reject) => {

        const session_id = getCookie('epoch_session_id');

        if (!session_id) {
            reject('No session cookie found');
            return;
        }

        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('PUT', `${serverUrl}/api/notifications/id/`, true);
        xhr.setRequestHeader('Notif-Id', notificationId);
        xhr.setRequestHeader('Session-Id', session_id);
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
                    resolve();
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        }

        xhr.send();
    });
}

function markAllNotificationsRead(userId)
{
    return new Promise((resolve, reject) => {

        const session_id = getCookie('epoch_session_id');

        if (!session_id) {
            reject('No session cookie found');
            return;
        }

        const xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('PUT', `${serverUrl}/api/notifications/read/all/user/`, true);
        xhr.setRequestHeader('User-Id', userId);
        xhr.setRequestHeader('Session-Id', session_id);
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
                    resolve();
                } else {
                    if (xhr.status !== 0) {
                        reject(xhr.statusText);
                    } else {
                        reject("Connection refused: The server is not running or unreachable");
                    }
                }
            }
        }

        xhr.send();
    });
}



module.exports = { getUserNotifications, markNotificationRead, markAllNotificationsRead };