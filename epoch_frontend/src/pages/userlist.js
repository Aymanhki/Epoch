import { followAccount, unfollowAccount } from "../services/following";
import { fillUserList } from "../services/new_following";
import React, {useState, useEffect, useContext} from 'react';
import {useNavigate} from "react-router-dom";
import {Spinner} from '../modules/Spinner'
import NavBar from "../modules/NavBar";
import {UserContext} from "../services/UserContext";
import {getUserInfo} from "../services/user";
import { TextField } from "@mui/material";

function Userlist() {
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState({});
    const [filteredList, setFilteredList] = useState(null);
    const [changedStatus, changeStatus] = useState(false);
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const { user } = useContext(UserContext);
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState("");

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
        console.log(target, isFollowing, "following");
        if (isFollowing){
            unfollowAccount(target);
        }
        else {
            followAccount(target);
        }
        for (var i in userList) {
            if (userList[i].user_id === target) {
                userList[i].isFollowing = !isFollowing;
            }
        }
        userList.sort(function(a,b){
            return b.isFollowing - a.isFollowing;
        });
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
            console.error("Error fetching following list:", error);
            navigate('/epoch/profile/');
        });
    },[setUserList, navigate, updateUser, user]);

    useEffect(() => {
        changeStatus(false);
    },[changeStatus]);

    useEffect(() => {
        if(searchInput === '') {
            setFilteredList(null);
        }
        else {
            var tempFiltered = [];
    
            for(var i in userList) {
                if( userList[i].username.toLowerCase().includes(searchInput) ) {
                    tempFiltered.push(userList[i]);
                }
            }
            setFilteredList(tempFiltered);
        }
        console.log(filteredList);
        changeStatus(!changedStatus);
    },[searchInput, changedStatus, filteredList, userList]);

    useEffect(() => {
        if(!user){
            navigate('/epoch/home/');
        }
    },[user, navigate,]);

    return (
        <>
            {!user ?  (navigate('/epoch/profile/')) : (
                isLoading ? <Spinner/> : (
                    <div className="UserListContainer">
                        <NavBar profilePic={user.profile_pic_data} profilePicType={user.profile_pic_type} showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup} />
                        <h1>List of all Epoch Users</h1>

                        <TextField className="search-bar"
                            variant="outlined"
                            label = "Search users."
                            onChange={handleChange}
                        />
                        <ul className="user-list">
                            {filteredList && searchInput ? (
                                filteredList && filteredList.map && filteredList.map(account =>
                                    <li key = {account.user_id} className="user-list-items">
                                        <p>
                                            <b className="username">{account.username}: </b>
                                            {account.isFollowing ? <b className="following-status">(following)</b>:<b> </b>}
                                        </p>
        
                                        <div>
                                            <button type="button" className="search-follow button" onClick = {() => {
                                                handleFollow( account.user_id, account.isFollowing)
                                            }}>{getFollowingPrompt(account.isFollowing)}</button>
                                            <button type="button" className="profile-button" onClick = {() => {
                                                navigate('/epoch/'+ account.username)
                                            }}>view profile</button>
                                        </div>
                                    </li>
                                    )
                            ):(
                                userList && userList.map && userList.map(account =>
                                    <li key = {account.user_id} className="user-list-items">
                                        <p>
                                            <b className="username">{account.username}: </b>
                                            {account.isFollowing ? <b className="following-status">(following)</b>:<b> </b>}
                                        </p>
        
                                        <div>
                                            <button type="button" className="search-follow button" onClick = {() => {
                                                handleFollow( account.user_id, account.isFollowing)
                                            }}>{getFollowingPrompt(account.isFollowing)}</button>
                                            <button type="button" className="profile-button" onClick = {() => {
                                                navigate('/epoch/'+ account.username)
                                            }}>view profile</button>
                                        </div>
                                    </li>
                                    )
                            )}
                            
                        </ul>
                    </div>
                    
                )
            )}
        </>
    );
}
export default Userlist;
