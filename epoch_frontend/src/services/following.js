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
        .then(response => response.json())
        .catch(error => {
            //this.setState({ errorMessage: error.toString() }); // this was causing an error in rendering the rest of the profile so i commented it for now, console.error should be enough - Ayman
            console.error('There was an error getting users lists!', error);
            return false;
        });

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
        .then(response => response.json())
        .catch(error => {
            //this.setState({ errorMessage: error.toString() }); // this was causing an error in rendering the rest of the profile so i commented it for now, console.error should be enough - Ayman
            console.error('There was an error getting following lists!', error);
            return false;
        });

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
        credentials:'include',
        body: JSON.stringify(params)
    })
        .catch(error => {
            //this.setState({ errorMessage: error.toString() }); // this was causing an error in rendering the rest of the profile so i commented it for now, console.error should be enough - Ayman
            console.error('There was an error following an account!', error);
            return false;
        });
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
        credentials:'include',
        body: JSON.stringify(params)
    })
        .catch(error => {
            //this.setState({ errorMessage: error.toString() }); // this was causing an error in rendering the rest of the profile so i commented it for now, console.error should be enough - Ayman
            console.error('There was an error unfollowing an account!', error);
            return false;
        });

}

module.exports = {getAccountList, getFollowingList, followAccount, unfollowAccount}