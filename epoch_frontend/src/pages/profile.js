import { getUsernameInfo } from '../services/user';
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';

// need to distinguish if this is the current user logged in
    //should show edits if yes, show follow if not logged in
function Profile() {
    const { username } = useParams();
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false);


    useEffect(() => {
        setIsLoading(true);
        getUsernameInfo(username)
            .then(data => {
                if (data) {
                    setUserInfo(data);
                    setIsLoading(false);
                }
                else {
                    setUserNotFound(true)
                    setIsLoading(false)
                }
            })
            .catch(error => {
                console.error("Error fetching user info:", error);
                setIsLoading(false);
            });
    }, []);
    if (userNotFound) {
        return (
            <div>
                <h1> USER NOT FOUND </h1>
            </div>
        );  
    }
    else {
        return (
            <div>
                <h1> HELLO! </h1>
                <h1> From address = [{username}] </h1>
                <h1> From get = [{userInfo.username}]</h1>
            </div>
        );
    }
}

export default Profile;
