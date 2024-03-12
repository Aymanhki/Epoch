import {getUserInfo, getUsernameInfo} from '../services/user';
import {getFollowingList, unfollowAccount, followAccount, profileFollowNetwork} from '../services/following';
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
import {useSpring, animated} from 'react-spring';


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
    const [followerCount, setFollowerCount] = useState("....");
    const [followingCount, setFollowingCount] = useState("....");
    const [followerList, setFollowerList] = useState({});
    const [followingList, setFollowingList] = useState({});
    const [popupList, setPopupList] = useState({});
    const [showUserListModal, setShowUserListModal] = useState(false); // State to manage UserListModal visibility
    const [showingFol, setShowingFol] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    const {transform: inTransform} = useSpring({
        transform: `translateY(${showUserListModal ? 0 : 100}vh)`,
        config: {duration: 300},
    });

    const {transform: outTransform} = useSpring({
        transform: `translateY(${showUserListModal ? 0 : -100}vh)`,
        config: {duration: 300},
    });

    function clickedFollow(target, isFollowing) {
        if (isFollowing) {
            unfollowAccount(target);
            setIsFollowingPrompt('Follow');
            setIsFollowing(false);
            setFollowerCount("...");
        } else {
            followAccount(target);
            setIsFollowingPrompt('Unfollow');
            setIsFollowing(true);
            setFollowerCount("...");
        }
        setIsCurrentUser(false);
    }

    const handleProfilePhotoClick = (imageUrl) => {
        setOverlayImageUrl(imageUrl);
        setShowOverlay(true);
    };

    const handleCountClick = (countClicked) => {
        setPopupList({});

        setShowUserListModal(!showUserListModal);

        if (countClicked === "following") {
            setShowingFol(false);
        } else {
            setShowingFol(true);
        }
    };

    const closeOverlay = () => {
        setShowOverlay(false);
        setOverlayImageUrl('');
    };

    const setFollowDefaults = () => {
        setShowUserListModal(false);
        setFollowerCount("....");
        setFollowingCount("....");
        setPopupList({});
        setShowingFol(false);
    }

    useEffect(() => {
        setIsLoading(true);
        setFollowDefaults();
        if (!user) {
            getUserInfo()
                .then(data => {
                    updateUser(data);
                    setFollowDefaults();
                })
                .catch(error => {
                    setIsLoading(false);
                    updateUser(null);
                });
        }
    }, [setIsLoading, setIsCurrentUser, updateUser, user]);

    useEffect(() => {
        setFollowDefaults();
        if (user && (user.username === username || username === "profile")) {
            setUserInfo(user);
            setIsCurrentUser(true);
        } else if (username !== "profile") {
            setIsLoading(true);
            getUsernameInfo(username)
                .then(data => {
                    setUserInfo(data);
                    setIsCurrentUser(false);
                    setViewedID(data.id)
                })
                .catch(error => {
                    setIsLoading(false);
                    console.log("Error fetching user info:", error);
                    setUserNotFound(true);
                });
        }
    }, [setIsLoading, setIsCurrentUser, user, username]);

    useEffect(() => {
        if (viewedId && user) {
            getFollowingList("self")
                .then(data => {
                    for (var i in data) {
                        if (data[i].following_id === viewedId) {
                            setIsFollowing(true);
                            setIsFollowingPrompt('Unfollow');
                        }
                    }
                })
                .catch(error => {
                    console.log("Error fetching following list:", error);
                });
        }

    }, [setIsFollowing, setIsFollowingPrompt, viewedId, user]);

    useEffect(() => {
        if (isCurrentUser) {
            profileFollowNetwork("self")
                .then(data => {
                    setFollowingCount(data[0]);
                    setFollowerCount(data[1]);
                    setFollowingList(data[2]);
                    setFollowerList(data[3]);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.log("Error fetching follower list:", error);
                    setIsLoading(false);
                })
        } else if (viewedId && viewedId > -1) {
            profileFollowNetwork(viewedId)
                .then(data => {
                    setFollowingCount(data[0]);
                    setFollowerCount(data[1]);
                    setFollowingList(data[2]);
                    setFollowerList(data[3]);
                    setIsLoading(false);
                })
                .catch(error => {
                        console.log("Error fetching follower list:", error);
                        setIsLoading(false);
                    }
                )
        }
    }, [isCurrentUser, viewedId, user, isFollowing]);

    useEffect(() => {
        if (showingFol) {
            setPopupList(followerList);
        } else {
            setPopupList(followingList);
        }
    }, [showUserListModal, followerList, followingList, showingFol]);

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
                                    <BorderColorOutlinedIcon className="edit-profile-button-icon"
                                                             onClick={() => setShowEditProfilePopup(!showEditProfilePopup)}/>
                                    <FavoriteBorderOutlinedIcon className={'profile-favorite-button'}
                                                                onClick={() => navigate('/epoch/favorites')}></FavoriteBorderOutlinedIcon>
                                </div>

                            ) : (
                                <button className={"follow-button"}
                                        onClick={clickedFollow.bind(this, viewedId, isFollowing)}> {isFollowingPrompt} </button>
                            )
                        )}
                        <div className="counts-wrapper">
                            <button className="following-count" onClick={() => handleCountClick("following")}>
                                Following: {followingCount}
                            </button>
                            <button className="follower-count" onClick={() => handleCountClick("followers")}>
                                Followers: {followerCount}
                            </button>
                        </div>
                    </div>

                    <div className="profile-feed">
                        {user ? (
                            <Feed feedUsername={userInfo.username} feedUserId={userInfo.id} isInProfile={true}
                                  currentUser={user} showNewPostPopup={showNewPostPopup}
                                  setShowNewPostPopup={setShowNewPostPopup} refreshFeed={refreshFeed}
                                  setRefreshFeed={setRefreshFeed} posts={null} isInFavorites={false}/>
                        ) : (
                            <Feed feedUsername={userInfo.username} feedUserId={userInfo.id} isInProfile={true}
                                  currentUser={null} showNewPostPopup={showNewPostPopup}
                                  setShowNewPostPopup={setShowNewPostPopup} refreshFeed={refreshFeed}
                                  setRefreshFeed={setRefreshFeed} viewingOnly={true} posts={null}
                                  isInFavorites={false}/>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* UserListModal */}


                <animated.div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: showUserListModal ? inTransform : outTransform,
                        zIndex: 1000
                    }}
                >
                    <div className="modal-overlay" onClick={() => setShowUserListModal(false)}></div>

                    <div className="user-list-modal">
                        <ul className="popup-user-list">
                            {popupList && popupList.map && popupList.map(account =>
                                <li key={account.user_id} className="popup-list-item">
                                    <p>
                                        <b className="username"
                                           onClick={() => navigate('/epoch/' + account.username)}>@{account.username}</b>
                                    </p>
                                </li>
                            )}
                        </ul>
                    </div>

                </animated.div>


            {
                user != null && (
                    <>
                        <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup}
                                   username={user.username} profilePic={user.profile_pic_data}
                                   refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed}/>

                        {showEditProfilePopup &&
                            <EditProfilePopup user={user} onClose={() => setShowEditProfilePopup(!showEditProfilePopup)}/>}
                    </>
                )}

            {showOverlay && (
                <div className={'full-size-profile-photo-overlay'} onClick={closeOverlay}>
                            <img src={overlayImageUrl} alt="Full Size" className="full-size-image"/>
                        </div>
                    )}

        </>
    );
}

export default Profile;
