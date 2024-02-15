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
    const currentLocation = window.location;
    const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
    const url = `${serverUrl}/api/follow/accountList/`;
    const headers = {credentials: 'include'}

    const data = fetch(url, headers)
        .then(response => response.json());

    return(data)
}

function getFollowingList() {
    const session_id = getCookie('epoch_session_id');
    if (!session_id) {
        return;
    }
    const currentLocation = window.location;
    const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
    const url = `${serverUrl}/api/follow/followingList/`;
    const headers = {credentials: 'include'}

    const data = fetch(url, headers)
        .then(response => response.json());

    return(data)    
}

function followAccount(userToFollow) {
    const session_id = getCookie('epoch_session_id');
    if (!session_id) {
        return;
    }
    var params = {
        session_id: session_id,
        userToFollow: userToFollow
    }
    const currentLocation = window.location;
    const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
    const url = `${serverUrl}/api/follow/follow/`;

    fetch(url,{
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(params)
    })
}

function unfollowAccount(userToUnfollow) {
    const session_id = getCookie('epoch_session_id');
    if (!session_id) {
        return;
    }
    var params = {
        session_id: session_id,
        userToUnfollow: userToUnfollow
    }
    const currentLocation = window.location;
    const serverUrl = `${currentLocation.protocol}//${currentLocation.hostname}:8080`;
    const url = `${serverUrl}/api/follow/unfollow/`;
    fetch(url,{
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(params)
    })
        .then(response=>response.json());

    return false;
}

module.exports = {getAccountList, getFollowingList, followAccount, unfollowAccount}