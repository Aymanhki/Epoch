import {getUserInfo, getUsernameInfo} from '../services/user';
import React, {useState, useEffect, useContext} from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {useNavigate} from "react-router-dom";
import {NotFound} from "./notFound";
import NavBar from "../modules/NavBar";
import { Spinner } from "../modules/Spinner";
import {UserContext} from "../services/UserContext";

// need to distinguish if this is the current user logged in
//should show edits if yes, show follow if not logged in
function Profile() {
    const { username } = useParams();
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { updateUser } = useContext(UserContext);
    const [isCurrentUser, setIsCurrentUser] = useState(false);

    useEffect(() => {

        setIsLoading(true);
        if (!user) {
            getUserInfo()
                .then(data => {
                    updateUser(data);
                    setIsLoading(false);
                })
                .catch(error => {
                    setIsLoading(false);
                    updateUser(null);
                });
        }
    }, [setIsLoading, setIsCurrentUser, updateUser, user]);

    useEffect(() => {
        if(user && (user.username === username || username === "profile")) {
            setUserInfo(user);
            setIsCurrentUser(true);
            setIsLoading(false);
        }
        else if(user)
        {
            setIsLoading(true);
            getUsernameInfo(username)
                .then(data => {
                    setUserInfo(data);
                    setIsLoading(false);
                    setIsCurrentUser(false);
                })
                .catch(error => {
                    setIsLoading(false)
                    console.error("Error fetching user info:", error);
                    setUserNotFound(true);
                });
        }
    }, [setIsLoading, setIsCurrentUser, user, username]);

    if(!user) {
        return <Spinner />
    }

    if(userNotFound) {
        return <NotFound />
    }

    return (
        <>
            {<NavBar profilePic={user.profile_pic_data}/>}
            {isLoading ? (<Spinner />) : (
                <div>
                    <h1>Profile Page</h1>
                    <h1> HELLO! </h1>
                    <h1> From address = [{username}] </h1>
                    <h1> From get = [{userInfo.username}]</h1>
                    <h1> name = [{userInfo.name}]</h1>
                    <h1> Is this the current user? [{isCurrentUser.toString()}]</h1>

                    {userInfo.profile_pic_data && (
                        <img
                          src={userInfo.profile_pic_data}
                          alt="Profile Pic"
                          style={{ maxWidth: "300px" }}
                        />
                    )}
                </div>
            )}
        </>
    );
}

export default Profile;
