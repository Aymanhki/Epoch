function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function removeSessionCookie() {
    document.cookie = "epoch_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function getAccountList() {
    return new Promise((resolve, reject) => {

        const session_id = getCookie('epoch_session_id');

        if (!session_id) {
            reject('No session cookie found');
            return;
        }

        var xhr = new XMLHttpRequest();
        const currentLocation = window.location;
        const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
        xhr.open('GET', `${serverUrl}/api/accountList/`, true);
        xhr.setRequestHeader('Content-Type', 'plain/text');
        xhr.withCredentials = true;
        xhr.timeout = 10000;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const accountData = JSON.parse(xhr.responseText);
                    resolve(accountData);
                } else {
                    reject(xhr.statusText);
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

module.exports = {getAccountList}