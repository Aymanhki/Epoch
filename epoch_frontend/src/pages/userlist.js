import {getAccountList, followAccount, unfollowAccount, getFollowingList} from "../services/following"
import React, {useState, useEffect} from 'react';
import {Spinner} from '../modules/Spinner'
import {useNavigate} from "react-router-dom";

function follow(target) {
    console.log("followed " + target);
    followAccount(target);
}

function unfollow(target) {
    console.log("unfollowed " + target);
    unfollowAccount(target);
}

function Userlist() {
    const [isLoading, setIsLoading] = useState(false);
    const [followingIds, setFollowingList] = useState({});
    const [userList, setUserList] = useState({});
    const navigate = useNavigate();

    //on load get these lists from backend
    useEffect(()=>{
        (async ()=>{
            setIsLoading(true);
            await fetchData();
            setIsLoading(false);
        })();
    }, []);

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

            setUserList(user_data);
            setFollowingList(following_data);
        } catch (error) {
            console.error('Error fetching data ... returning to profile page: ', error);
            navigate('/epoch/profile');
        }
    }

    return (
        <div>
            {isLoading && followingIds ? <Spinner/>: (
                <>
                    <h1>Userlist Page</h1>
                    <h2>userInfo.name you are following</h2>
                    <h2>list accounts im following</h2>
                    <ul>
                        {followingIds && followingIds.map && followingIds.map(following =>
                            <li key = {following.following_id}>
                                <p>
                                    <b>{following.username}: </b>
                                    &emsp; following 
                                </p>
                                <div>
                                    <button type="button" onClick = {unfollow.bind(this, following.following_id)}>unfollow</button>
                                </div>
                            </li>
                            )}
                    </ul>
                    <h2>list all other accounts</h2>
                    <ul>
                        {userList && userList.map && userList.map(account =>
                            <li key = {account.user_id}>
                                <p>
                                    <b>{account.username}: </b>
                                    &emsp; not following 
                                </p>
                                <div>
                                    <button type="button" onClick = {follow.bind(this, account.user_id)}>follow</button>
                                </div>
                            </li>
                            )}
                    </ul>                  
                </>
            )}

        </div>
    );
}

export default Userlist;