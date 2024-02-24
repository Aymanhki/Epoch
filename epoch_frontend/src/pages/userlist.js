import { followAccount, unfollowAccount } from "../services/following";
import { getAccountList, getFollowingList } from "../services/new_following";
import React, {useState, useEffect, useContext} from 'react';
import {Spinner} from '../modules/Spinner'
import {useNavigate} from "react-router-dom";
import NavBar from "../modules/NavBar";
import {UserContext} from "../services/UserContext";
import {getUserInfo} from "../services/user";

function Userlist() {
    const [isLoading, setIsLoading] = useState(false);
    const [followingIds, setFollowingList] = useState({});
    const [userList, setUserList] = useState({});
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const { user } = useContext(UserContext);
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    function follow(target) {
        console.log("followed " + target);
        followAccount(target);

        for (var i in userList) {
            if (userList[i].user_id === target) {
                userList.isFollowing = true;
            }
        }
    }
    
    function unfollow(target) {
        console.log("unfollowed " + target);
        unfollowAccount(target);
        
        for (var i in userList) {
            if (userList[i].user_id === target) {
                userList.isFollowing = false;
        window.location.reload(true);
    }

    //on load get these lists from backend
    useEffect(()=>{
        (async ()=>{
            setIsLoading(true);
            await fetchData();
            setIsLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (!user) {
             setIsLoading(true);
            getUserInfo()
                .then(data => {
                        updateUser(data);
                        setIsLoading(false);
                })
                .catch(error => {
                        setIsLoading(false);
                        updateUser(null);
                });
             setIsLoading(false);
        }

        setIsLoading(false);
    }, [setIsLoading, updateUser, user]);

    const fetchData = async () => {
        try{
            var user_data = await getAccountList();
            var following_data = await getFollowingList();
            let temp = user_data;

            for(var i in following_data){
                for(var j in user_data){
                    if(following_data[i].following_id === temp[j].user_id){
                        following_data[i].username = temp[j].username;
                        user_data.splice(j,1);
                    }
                }
            }
        }
    }

    useEffect(() => { // get user list
    if(!user) {
        return <Spinner />
    }
    
/*
    useEffect(()=>{
        setIsLoading(true);
        getAccountList()
        .then(data=>{
            for (var i in data) {
                data[i].isFollowing = false;
            }
            setUserList(data);
            //setIsLoading(false);
        })
        .catch(error => {
            setIsLoading(false);
            console.error("Error fetching user list:", error);
            navigate('/epoch/profile/');
        });
    },[setUserList, setIsLoading, navigate]);

    useEffect(() => { // get following list
        setIsLoading(true);
        getFollowingList()
        .then(data=>{
            var user_data = userList;
            var following_data = data;
    
            for(var i in following_data){
                for(var j in user_data){
                    if(following_data[i].following_id === user_data[j].user_id) {
                        user_data[j].isFollowing = true;
                    }
                }
            }
            if(user_data.length>0){
                user_data.sort(function(a,b){
                    return b.isFollowing - a.isFollowing;
                });
            }
            setFollowingList(data);
            setIsLoading(false);
        })
        .catch(error => {
            setIsLoading(false);
            console.error("Error fetching following list:", error);
            navigate('/epoch/profile/');
        });
    },[ setFollowingList, setIsLoading, navigate, userList]);

    return (
        <div>
            <NavBar profilePic={user.profile_pic_data } profilePicType={user.profile_pic_type} showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup} />
            {isLoading && followingIds ? <Spinner/>: (
                <>
                    <h1>List of all Epoch Users</h1>
                    <ul>
                        {userList && userList.map && userList.map(account =>
                            <li key = {account.user_id}>
                                <p>
                                    <b>{account.username}: </b>
                                    {account.isFollowing ? <b>(following)</b>:<b> </b>}
                                     
                                </p>

                                <div>
                                    
                                    <button type="button" onClick = {() => {
                                        navigate('/epoch/'+ account.username)
                                    }}>view profile</button>
                                </div>
                            </li>
                            )}
                    </ul> 
                </div>
                
            )}

        </>
    );
}
/* this is just slow and ugly and doesnt update properly 
                                <div>
                                {account.isFollowing ? <button type="button" onClick = {
                                        unfollow.bind(this, account.user_id)
                                    }>unfollow</button> : <button type="button" onClick = {
                                        follow.bind(this, account.user_id)
                                    }>follow</button>}

                                </div>
*/
export default Userlist;