import { followAccount, unfollowAccount } from "../services/following";
import { getAccountList, getFollowingList } from "../services/new_following";
import React, {useState, useEffect, useContext} from 'react';
import {Spinner} from '../modules/Spinner'
import {useNavigate} from "react-router-dom";
import NavBar from "../modules/NavBar";
import {UserContext} from "../services/UserContext";



function Userlist() {
    const [isLoading, setIsLoading] = useState(false);
    const [followingIds, setFollowingList] = useState({});
    const [userList, setUserList] = useState({});
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    function follow(target) {
        console.log("followed " + target);
        followAccount(target);

        for (var i in userList) {
            if (userList[i].user_id === target) {
                followingIds.push({"username": userList[i].username, "following_id": target});
                userList.splice(i,1);
            }
        }
        setUserList(userList);
    }
    
    function unfollow(target) {
        console.log("unfollowed " + target);
        unfollowAccount(target);
        for (var i in followingIds) {
            if (followingIds[i].following_id === target) {
                userList.push({"username":followingIds[i].username, "user_id":followingIds[i].following_id});
                followingIds.splice(i,1);
            }
        }
        setFollowingList(followingIds);
    }

    useEffect(() => { // get user list
        setIsLoading(true);
        getAccountList()
        .then(data=>{
            setUserList(data);
            setIsLoading(false);
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
                    if(following_data[i].following_id === user_data[j].user_id){
                        following_data[i].username = user_data[j].username;
                        user_data.splice(j,1);
                    }
                }
            }
            setFollowingList(following_data);
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
            {isLoading && followingIds ? <Spinner/>: (
                <>
                    <h1>List of all Epoch Users</h1>

                </>
            )}

        </div>
    );
}

export default Userlist;