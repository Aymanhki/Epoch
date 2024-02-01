import {getUserInfo} from "../services/user";
import React, {useState, useEffect} from 'react';

function Profile() {

    // State variable for redirect
    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    // Check for valid session cookie on component mount
    useEffect(() => {
        getUserInfo()
            .then(data => {
                setRedirectToLogin(false);
                setUserInfo(data);
            })
            .catch(error => {setRedirectToLogin(true);});
    }, []);

    // Redirect to home if redirectToHome is true
    if (redirectToLogin) {
        window.location.href = "/epoch/login";
        return <div><h2>User Not Signed In</h2></div>;
    }

    return (
        <div>
            <h1>Profile Page</h1>
            <h2> Hello {userInfo.name}</h2>
            {userInfo.profile_pic_data && (
                <img src={userInfo.profile_pic_data} alt="Profile Pic" style={{ maxWidth: '100px' }} />
            )}
            <h2>Your user id is {userInfo.id}</h2>
            <h2>Your username is {userInfo.username}</h2>
            <h2>Your password is {userInfo.password}</h2>
            <h2>Your account was created at {userInfo.created_at}</h2>
            <h2>Your account bio is {userInfo.bio}</h2>
            <h2>Your account profile pic id is {userInfo.profile_pic_id}</h2>
        </div>
    );
}

export default Profile;