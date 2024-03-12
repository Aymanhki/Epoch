import {fillUserList, followAccount, unfollowAccount} from "../services/following";
import React, {useState, useEffect, useContext} from 'react';
import {useNavigate} from "react-router-dom";
import {Spinner} from '../modules/Spinner'
import NavBar from "../modules/NavBar";
import {UserContext} from "../services/UserContext";
import {getUserInfo} from "../services/user";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import {TextField} from "@mui/material";
import '../styles/UserList.css'
import PostPopup from "../modules/PostPopup";

function Userlist() {
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState({});
    const [filteredList, setFilteredList] = useState(null);
    const [changedStatus, changeStatus] = useState(false);
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const [refreshFeed, setRefreshFeed] = useState(false);
    const {user} = useContext(UserContext);
    const {updateUser} = useContext(UserContext);
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState("");
    const [darkMode, setDarkMode] = useState(false);


    let handleChange = (event) => {
        setSearchInput(event.target.value.toLowerCase());
    };

    function getFollowingPrompt(isFollowing) {
        if (isFollowing) {
            return "Unfollow";
        }
        return "Follow";
    }

    function handleFollow(target, isFollowing) {
        if (isFollowing) {
            unfollowAccount(target)
                .catch(error => {
                    console.log("Error unfollowing user:", error);
                })
        } else {
            followAccount(target)
                .catch(error => {
                    console.log("Error following user:", error);
                })
        }

        for (var i in userList) {
            if (userList[i].user_id === target) {
                userList[i].isFollowing = !isFollowing;
            }
        }

        // userList.sort(function(a,b){
        //     return b.isFollowing - a.isFollowing;
        // });

        setUserList(userList);
        changeStatus(!changedStatus);
    }

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
    }, [setIsLoading, updateUser, user]);

    useEffect(() => {
        setIsLoading(true);
        if (!user) {
            updateUser(null);
        }
        fillUserList()
            .then(data => {
                setUserList(data);
                setIsLoading(false);
                changeStatus(false);
            })
            .catch(error => {
                setIsLoading(false);
                console.log("Error fetching following list:", error);
                navigate('/epoch/profile/');
            });
    }, [setUserList, navigate, updateUser, user, setIsLoading]);

    useEffect(() => {
        changeStatus(false);
    }, [changeStatus]);

    useEffect(() => {
        if (searchInput === '') {
            setFilteredList(null);
        } else {
            var tempFiltered = [];

            for (var i in userList) {
                if (userList[i].username.toLowerCase().includes(searchInput)) {
                    tempFiltered.push(userList[i]);
                }
            }
            setFilteredList(tempFiltered);
        }
        changeStatus(!changedStatus);
    }, [searchInput, changedStatus, filteredList, userList]);

    useEffect(() => {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setDarkMode(darkModeMediaQuery.matches);

        const darkModeChangeListener = (e) => setDarkMode(e.matches);
        darkModeMediaQuery.addEventListener('change', darkModeChangeListener);

        return () => {
            darkModeMediaQuery.removeEventListener('change', darkModeChangeListener);
        };
    }, []);


    useEffect(() => {
        if (!user) {
            navigate('/epoch/home/');
        }
    }, [user, navigate]);

    return (
        <>
            {!user ? (navigate('/epoch/home/')) : (
                isLoading ? <Spinner/> : (
                    <>
                        <NavBar profilePic={user.profile_pic_data} profilePicType={user.profile_pic_type}
                                showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup}/>
                        <div className={"user-list-page"}>
                            <div className="user-list-container">


                                <div className="user-list-search-bar-container">
                                    <TextField className="list-search-bar"
                                               label="Search users.."
                                               variant="outlined"
                                               onChange={handleChange}
                                               value={searchInput}
                                               InputProps={{style: {width: "100%"}}}
                                               sx={{
                                                   input: {
                                                       color: darkMode ? 'white' : '#1a2a6c', // Change color based on dark mode
                                                   }
                                               }}
                                    />
                                </div>


                                <ul className="user-list">
                                    {filteredList && searchInput ? (
                                        filteredList && filteredList.map && filteredList.map(account =>
                                            <li key={account.user_id} className={"user-list-items-container"}>

                                                <div className="user-list-item">
                                                    <div className="user-list-item-profile-icon-container">
                                                        <AccountCircleOutlinedIcon/>
                                                    </div>

                                                    <div className="user-list-item-username-container">
                                                        <b className="username"
                                                           onClick={() => navigate('/epoch/' + account.username)}>@{account.username} </b>
                                                    </div>

                                                    <div className="user-list-item-following-status-container">
                                                        {account.isFollowing ?
                                                            <b className="following-status"> (following)</b> :
                                                            <b> </b>}
                                                    </div>

                                                    <div className="user-list-item-follow-button-container">
                                                        <button type="button" className="search-follow-button"
                                                                onClick={() => {
                                                                    handleFollow(account.user_id, account.isFollowing)
                                                                }}>{getFollowingPrompt(account.isFollowing)}</button>
                                                    </div>

                                                </div>
                                            </li>
                                        )
                                    ) : (
                                        userList && userList.map && userList.map(account =>
                                            <li key={account.user_id} className={"user-list-items-container"}>

                                                <div className="user-list-item">
                                                    <div className="user-list-item-profile-icon-container">
                                                        <AccountCircleOutlinedIcon/>
                                                    </div>

                                                    <div className="user-list-item-username-container">
                                                        <b className="username"
                                                           onClick={() => navigate('/epoch/' + account.username)}>@{account.username} </b>
                                                    </div>

                                                    <div className="user-list-item-following-status-container">
                                                        {account.isFollowing ?
                                                            <b className="following-status"> (following)</b> :
                                                            <b> </b>}
                                                    </div>

                                                    <div className="user-list-item-follow-button-container">
                                                        <button type="button" className="search-follow-button"
                                                                onClick={() => {
                                                                    handleFollow(account.user_id, account.isFollowing)
                                                                }}>{getFollowingPrompt(account.isFollowing)}</button>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    )}

                                </ul>
                            </div>
                        </div>
                        <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup}
                                   username={user.username} profilePic={user.profile_pic_data} refreshFeed={refreshFeed}
                                   setRefreshFeed={setRefreshFeed}/>

                    </>
                )
            )}
        </>
    );
}

export default Userlist;
