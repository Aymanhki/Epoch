import {getUserInfo, getUsernameInfo} from '../services/user';
import React, {useState, useEffect, useContext} from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {useNavigate} from "react-router-dom";
import {NotFound} from "./notFound";
import NavBar from "../modules/NavBar";
import { Spinner } from "../modules/Spinner";
import {UserContext} from "../services/UserContext";
import '../styles/Profile.css'
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import Feed from "../modules/Feed";

function Profile() {
    const { username } = useParams();
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { updateUser } = useContext(UserContext);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowingPrompt, setIsFollowingPrompt] = useState('Follow');

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
            <NavBar profilePic={user.profile_pic_data} />
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="profile-page-container">
                    <div className="profile-wrapper">
                        <div className="profile-info-wrapper">
                            {userInfo.profile_pic_data && (
                                <div className="profile-pic-wrapper">
                                    <img
                                        src={userInfo.profile_pic_data}
                                        alt="Profile Pic"
                                        className="profile-pic"
                                    />
                                    {userInfo.profile_background_pic_data ? (
                                        <img
                                            src={userInfo.profile_background_pic_data}
                                            alt="Background Pic"
                                            className="background-pic"
                                        />
                                    ) : (
                                        <img
                                            src={process.env.PUBLIC_URL + '/images/default_profile_background.png'}
                                            alt="Background Pic"
                                            className="background-pic"
                                        />
                                    )}
                                </div>
                            )}
                            <h1 className="profile-name">{userInfo.name}</h1>
                            <h2 className="profile-username">@{userInfo.username}</h2>

                            {isCurrentUser ? (
                                <BorderColorOutlinedIcon className="edit-profile-button-icon" onClick={() => navigate('/edit-profile')} />
                            ) : (
                                <button className={"follow-button"}>{isFollowingPrompt}</button>
                            )}
                        </div>
                        {/*<div>*/}
                        {/*    <h1>From address = [{username}]</h1>*/}
                        {/*    <h1>From get = [{userInfo.username}]</h1>*/}
                        {/*    <h1>Is this the current user? [{isCurrentUser.toString()}]</h1>*/}
                        {/*</div>*/}
                        <div className="profile-feed">
                            <Feed feedUsername={userInfo.username} isInProfile={true} currentUser={user} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Profile;
