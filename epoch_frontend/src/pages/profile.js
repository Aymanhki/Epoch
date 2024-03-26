import {getUserInfo, getUsernameInfo, deleteUser} from '../services/user';
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
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Feed from "../modules/Feed";
import EditProfilePopup from '../modules/EditProfilePopup';
import PostPopup from "../modules/PostPopup";
import {useSpring, animated} from 'react-spring';
import NoSessionNavBar from '../modules/NoSessionNavBar';
import PopupUserList from "../modules/PopupUserList";

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
    const [refreshProfile, setRefreshProfile] = useState(false);
    const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);
    const [deleteAccountError, setDeleteAccountError] = useState(false);
    const [deleteAccountErrorPrompt, setDeleteAccountErrorPrompt] = useState("");
    const [deletingAccount, setDeletingAccount] = useState(false);

    const {transform: inTransformDelete} = useSpring({
        transform: `translateY(${showDeleteAccountPopup ? 0 : 100}vh)`,
        config: {duration: 300},
    });

    const {transform: outTransformDelete} = useSpring({
        transform: `translateY(${showDeleteAccountPopup ? 0 : -100}vh)`,
        config: {duration: 300},
    });


    function clickedFollow(target, isFollowing) {
        if (isFollowing) {
            unfollowAccount(target);
            setIsFollowingPrompt('Please wait...');
            setIsFollowing(false);
            setFollowerCount("...");
        } else {
            followAccount(target);
            setIsFollowingPrompt('Please wait...');
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

                    if (data.username === username || username === "profile") {
                        setUserInfo(data);
                        setIsCurrentUser(true);
                    }
                    else
                    {
                        setIsCurrentUser(false);

                        getUsernameInfo(username)
                            .then(data => {
                                setUserInfo(data);
                                setViewedID(data.id);
                            })
                            .catch(error => {
                                setIsLoading(false);
                                setUserNotFound(true);
                            });
                    }

                    setIsLoading(false);

                })
                .catch(error => {
                    setIsLoading(false);
                    updateUser(null);

                    if (username !== "profile") {
                        getUsernameInfo(username)
                            .then(data => {
                                setUserInfo(data);
                                setViewedID(data.id);
                            })
                            .catch(error => {
                                setUserNotFound(true);
                            });
                    }
                    else
                    {
                        setRedirectToLogin(true);
                    }

                    setIsLoading(false);
                });
        }
        else
        {

            if (user.username === username || username === "profile") {
                setUserInfo(user);
                setIsCurrentUser(true);
            }
            else
            {
                setIsCurrentUser(false);

                getUsernameInfo(username)
                    .then(data => {
                        setUserInfo(data);
                        setViewedID(data.id);
                    })
                    .catch(error => {
                        setIsLoading(false);
                        setUserNotFound(true);
                    });
            }

            setIsLoading(false);
        }
    }, [setIsLoading, setIsCurrentUser, updateUser, user, username]);

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

    const fetchProfileFollowData = () => {
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
                });
        } else if (viewedId && viewedId > -1) {
            profileFollowNetwork(viewedId)
                .then(data => {
                    setFollowingCount(data[0]);
                    setFollowerCount(data[1]);
                    setFollowingList(data[2]);
                    setFollowerList(data[3]);
                    setIsLoading(false);
                    if (isFollowing) {
                        setIsFollowingPrompt('Unfollow');
                    } else {
                        setIsFollowingPrompt('Follow');
                    }
                })
                .catch(error => {
                    console.log("Error fetching follower list:", error);
                    setIsLoading(false);
                });
        }
    };

    useEffect(() => {
        fetchProfileFollowData();
    }, [isCurrentUser, viewedId, user, isFollowing]);

    useEffect(() => {
        if (showingFol) {
            setPopupList(followerList);
        } else {
            setPopupList(followingList);
        }
    }, [showUserListModal, followerList, followingList, showingFol]);

    useEffect(() => {

        if (refreshProfile) {
            setIsLoading(true);
            getUserInfo()
                .then(data => {
                    updateUser(data);
                    setUserInfo(data);
                    setRefreshProfile(false);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.log("Error fetching user info:", error);
                    setIsLoading(false);

                });
        }
    }, [refreshProfile, setRefreshProfile, updateUser]);

    const onDeleteAccount = () => {

        if(!user || deletingAccount) { return; }

        setShowDeleteAccountPopup(false);
        setIsLoading(true);
        setDeletingAccount(true);

        deleteUser(user.id)
            .then(data => {
                setIsLoading(false);
                updateUser(null);
                navigate('/epoch/login');
                setDeletingAccount(false);
            })
            .catch(error => {
                setDeleteAccountError(true);
                setDeleteAccountErrorPrompt(error);
                setShowDeleteAccountPopup(true);
                setIsLoading(false);
                setDeletingAccount(false);
            });

    }

    if (!user && !userInfo || deletingAccount) {
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
        {(user && (!deletingAccount))  ? (<NavBar profilePic={user.profile_pic_data} profilePicType={user.profile_pic_type}
                          showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup} userId={user.id}/>) :
                          (<NoSessionNavBar/>)}
        {(isLoading || deletingAccount) ? (
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
                                {userInfo.background_pic_data && (
                                    <img
                                        src={userInfo.background_pic_data}
                                        alt="Background Pic"
                                        className="background-pic"
                                        onClick={() => handleProfilePhotoClick(userInfo.background_pic_data)}
                                    />
                                )}
                            </div>
                        )}

                        <div className="profile-info-limiter">
                            <div><h1 className="profile-name">{userInfo.name}</h1></div>
                            <div><h2 className="profile-username">@{userInfo.username}</h2></div>
                            <div><h3 className="profile-bio">{userInfo.bio}</h3></div>
                        </div>
                        {user !== null && (
                            isCurrentUser ? (
                                <div className={'profile-buttons-wrapper'}>
                                    <BorderColorOutlinedIcon className="edit-profile-button-icon"
                                                             onClick={() => setShowEditProfilePopup(!showEditProfilePopup)}/>
                                    <FavoriteBorderOutlinedIcon className={'profile-favorite-button'}
                                                                onClick={() => navigate('/epoch/favorites')}></FavoriteBorderOutlinedIcon>
                                    <DeleteForeverOutlinedIcon className={'profile-delete-account-button'}
                                    data-testid="profile-delete-account-button" id="profile-delete-account-button"
                                                                onClick={() => setShowDeleteAccountPopup(true)}></DeleteForeverOutlinedIcon>

                                </div>

                            ) : (
                                <button className={"follow-button"}
                                        onClick={clickedFollow.bind(this, viewedId, isFollowing)}disabled={followerCount === "..."}> {isFollowingPrompt} </button>
                            )
                        )}
                        <div className="counts-wrapper">
                            
                            {(followingCount === "...." || followerCount === "....") && fetchProfileFollowData()}
                            
                            <button className="following-count" onClick={() => {
                                if (followingCount > 0) {
                                    handleCountClick("following")
                                }
                            }}>
                                Following: {followingCount}
                                
                            </button>
                            <button className="follower-count" onClick={() => {
                                if(followerCount > 0) {
                                    handleCountClick("followers")
                                }
                            }}>
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



            <PopupUserList showUserListModal={showUserListModal} setShowUserListModal={setShowUserListModal} popupList={popupList}/>


            <animated.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: showDeleteAccountPopup ? inTransformDelete : outTransformDelete,
                    zIndex: 1000
                }}
            >
                <div className="delete-modal-overlay" onClick={() => setShowDeleteAccountPopup(false)}></div>

                <div className="delete-account-modal">
                    <h3 className="delete-account-header">Are you sure you want to delete your account?</h3>
                    {deleteAccountError && <p className="delete-account-error">{deleteAccountErrorPrompt}</p>}

                    <div className={'delete-account-buttons-wrapper'}>
                    <button className="delete-account-button-no" onClick={() => setShowDeleteAccountPopup(false)}>No</button>
                    <button className="delete-account-button-yes" data-testid="delete-account-button-yes" id="delete-account-button-yes"
                    onClick={onDeleteAccount}>Yes</button>
                    </div>
                </div>

            </animated.div>


            {
                user != null && (
                    <>
                        <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup}
                                   username={user.username} profilePic={user.profile_pic_data}
                                   refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed}/>


                        <EditProfilePopup user={user} onClose={() => setShowEditProfilePopup(!showEditProfilePopup)} showEditProfilePopup={showEditProfilePopup} setShowEditProfilePopup={setShowEditProfilePopup} refreshProfile={refreshProfile} setRefreshProfile={setRefreshProfile} profilePicId={user.profile_pic_id} profilePicUrl={user.profile_pic_data} profilePicName={user.profile_pic_name} profilePicType={user.profile_pic_type} backgroundPicId={user.background_pic_id} backgroundPicUrl={user.background_pic_data} backgroundPicName={user.background_pic_name} backgroundPicType={user.background_pic_type} />
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
