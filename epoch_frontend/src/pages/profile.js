import {getUserInfo, getUsernameInfo} from '../services/user';
import {getFollowingList, unfollowAccount, followAccount} from '../services/following';
import React, {useState, useEffect, useContext} from 'react';
import {useParams} from 'react-router-dom';
import {NotFound} from "./notFound";
import NavBar from "../modules/NavBar";
import {redirect, useNavigate} from "react-router-dom";
import {Spinner} from "../modules/Spinner";
import {UserContext} from "../services/UserContext";
import '../styles/Profile.css'
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import Feed from "../modules/Feed";
import EditProfilePopup from '../modules/EditProfilePopup';
import PostPopup from "../modules/PostPopup";

function Profile() {
    const {username} = useParams();
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false);
    const {user} = useContext(UserContext);
    const {updateUser} = useContext(UserContext);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowingPrompt, setIsFollowingPrompt] = useState('Follow');
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const [showEditProfilePopup, setShowEditProfilePopup] = useState(false)
    const [viewedId, setViewedID] = useState({});
    const [refreshFeed, setRefreshFeed] = useState(false);
    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const navigate = useNavigate();
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayImageUrl, setOverlayImageUrl] = useState('');

    function clickedFollow(target, isFollowing) {
        if (isFollowing) {
            unfollowAccount(target);
            setIsFollowingPrompt('Follow');
            setIsFollowing(false);
        } else {
            followAccount(target);
            setIsFollowingPrompt('Unfollow');
            setIsFollowing(true);
        }
    }

    const handleProfilePhotoClick = (imageUrl) => {
        setOverlayImageUrl(imageUrl);
        setShowOverlay(true);
    };

    const closeOverlay = () => {
        setShowOverlay(false);
        setOverlayImageUrl('');
    };

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
        if (user && (user.username === username || username === "profile")) {
            setUserInfo(user);
            setIsCurrentUser(true);
            setIsLoading(false);
        } else if (username !== "profile") {
            setIsLoading(true);
            getUsernameInfo(username)
                .then(data => {
                    setUserInfo(data);
                    setIsLoading(false);
                    setIsCurrentUser(false);
                    setViewedID(data.id)
                })
                .catch(error => {
                    setIsLoading(false)
                    console.error("Error fetching user info:", error);
                    setUserNotFound(true);
                });
        }
    }, [setIsLoading, setIsCurrentUser, user, username]);

    useEffect(() => {
        if (viewedId && user) {
            getFollowingList()
                .then(data => {
                    for (var i in data) {
                        if (data[i].following_id === viewedId) {
                            setIsFollowing(true);
                            setIsFollowingPrompt('Unfollow');
                        }
                    }
                })
        }

    }, [getFollowingList, setIsFollowing, setIsFollowingPrompt, viewedId]);

    if (!user && !userInfo) {
        return <Spinner/>
    }

    if (userNotFound) {
        return <NotFound/>
    }

    if (redirectToLogin) {
        return navigate('/epoch/login');
    }

    return (
        <>
            {user && (<NavBar profilePic={user.profile_pic_data} profilePicType={user.profile_pic_type}
                              showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup}/>)}
            {isLoading ? (
                <Spinner/>
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
                                        onClick={() => handleProfilePhotoClick(userInfo.profile_pic_data)}
                                    />
                                    {userInfo.profile_background_pic_data ? (
                                        <img
                                            src={userInfo.profile_background_pic_data}
                                            alt="Background Pic"
                                            className="background-pic"
                                            onClick={() => handleProfilePhotoClick(userInfo.profile_background_pic_data)}
                                        />
                                    ) : (
                                        <img
                                            src={process.env.PUBLIC_URL + '/images/default_profile_background.png'}
                                            alt="Background Pic"
                                            className="background-pic"
                                            onClick={() => handleProfilePhotoClick(process.env.PUBLIC_URL + '/images/default_profile_background.png')}
                                        />
                                    )}
                                </div>
                            )}
                            <h1 className="profile-name">{userInfo.name}</h1>
                            <h2 className="profile-username">@{userInfo.username}</h2>
                            <h3 className="profile-bio">{userInfo.bio}</h3>
                            {user !== null && (
                                isCurrentUser ? (
                                    <div className={'profile-buttons-wrapper'}>
                                        {/*<BorderColorOutlinedIcon className="edit-profile-button-icon" onClick={() => setShowEditProfilePopup(!showEditProfilePopup)}/>*/}
                                        <FavoriteBorderOutlinedIcon className={'profile-favorite-button'} onClick={() => navigate('/epoch/favorites')}></FavoriteBorderOutlinedIcon>
                                    </div>

                                ) : (
                                    <button className={"follow-button"}
                                            onClick={clickedFollow.bind(this, viewedId, isFollowing)}> {isFollowingPrompt} </button>
                                )
                            )}
                        </div>
                        <div className="profile-feed">
                            {user ? (
                                <Feed feedUsername={userInfo.username} feedUserId={userInfo.id} isInProfile={true}
                                      currentUser={user} showNewPostPopup={showNewPostPopup}
                                      setShowNewPostPopup={setShowNewPostPopup} refreshFeed={refreshFeed}
                                      setRefreshFeed={setRefreshFeed} posts={null}  isInFavorites={false}/>
                            ) : (
                                <Feed feedUsername={userInfo.username} feedUserId={userInfo.id} isInProfile={true}
                                      currentUser={null} showNewPostPopup={showNewPostPopup}
                                      setShowNewPostPopup={setShowNewPostPopup} refreshFeed={refreshFeed}
                                      setRefreshFeed={setRefreshFeed} viewingOnly={true} posts={null}  isInFavorites={false}/>
                            )}
                        </div>

                    </div>

                    {user != null && (
                        <>
                            <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup}
                                       username={user.username} profilePic={user.profile_pic_data}
                                       refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed}/>

                            {showEditProfilePopup && <EditProfilePopup user={user}
                                                                       onClose={() => setShowEditProfilePopup(!showEditProfilePopup)}/>}
                        </>
                    )}

                    {showOverlay && (
                        <div className={'full-size-profile-photo-overlay'} onClick={closeOverlay}>
                            <img src={overlayImageUrl} alt="Full Size" className="full-size-image"/>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default Profile;
