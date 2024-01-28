function tryLogin(username, password) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/api/login", true); // Login the user
        xhr.setRequestHeader("Content-Type", "application/json"); // Set the request header
        xhr.withCredentials = true;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                if (xhr.status === 200) {
                    console.log("Login successful");
                    resolve(true);
                } else {
                    console.error("Error logging in user:", xhr.responseText);
                    reject(false);
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
    return new Promise( (resolve, reject) => {

        const session_id = getCookie('epoch_session_id');

        if (!session_id)
        {
            reject('No session cookie found');
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:8080/api/login', true); // Assuming you have an endpoint for fetching user info
        xhr.setRequestHeader('Authorization', `Bearer ${session_id}`);
        xhr.withCredentials = true;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const userInfo = JSON.parse(xhr.responseText);
                    resolve(userInfo);
                } else {
                    reject(`Error fetching user info: ${xhr.status}`);
                }
            }
        };

        xhr.send();
    });
}

module.exports = {tryLogin, getUserInfo};