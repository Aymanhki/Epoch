import { followAccount, unfollowAccount } from "../services/following";
import { fillUserList } from "../services/new_following";
import React, {useState, useEffect, useContext} from 'react';
import {Spinner} from '../modules/Spinner'
import {useNavigate} from "react-router-dom";
import NavBar from "../modules/NavBar";
import {UserContext} from "../services/UserContext";
import {getUserInfo} from "../services/user";

function Userlist() {
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState({});
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const { user } = useContext(UserContext);
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    
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
        fillUserList()
        .then(data => {
            setUserList(data);
            setIsLoading(false);
        })
        .catch(error => {
            setIsLoading(false);
            console.error("Error fetching following list:", error);
            navigate('/epoch/profile/');
        });
    },[setUserList, navigate]);



    return (
        <>
        <NavBar profilePic={user.profile_pic_data} profilePicType={user.profile_pic_type} showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup} />
            {isLoading ? <Spinner/>: (
                <div>
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