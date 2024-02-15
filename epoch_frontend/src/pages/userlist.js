import {getAccountList, followAccount, unfollowAccount, getFollowingList} from "../services/following"
import React, {useState, useEffect, map} from 'react';
import {Spinner} from '../modules/Spinner'

function follow(id, target) {
    console.log(id + " followed " + target);
    //create follow request and reload page?
    followAccount(target);
}

function unfollow(id, target) {
    console.log(id + " unfollowed " + target);
    //create unfollow request and reload page?
    unfollowAccount(target);
}

function Userlist() {
    // State variable for redirect
    const [isLoading, setIsLoading] = useState(false);
    const [followingIds, setFollowingList] = useState({});
    const [userList, setUserList] = useState({});
    const userId = 1;

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
                    if(following_data[i].following_id == temp[j].user_id){
                        following_data[i].username = temp[j].username;
                        user_data.splice(j,1);
                    }
                }
            }

            setUserList(user_data);
            setFollowingList(following_data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    }

    var followingList = [
        {id:1, username:'John123'},
        {id:2, username:'Bob234'},
        {id:5, username:'xXBilly42069Xx'}];
    var accountList = [
        {id:1, username:'John123'},
        {id:2, username:'Bob234'},
        {id:3, username:'Kate909'},
        {id:4, username:'Obama23'},
        {id:5, username:'xXBilly42069Xx'}];

    //remove followed accounts from account list
    for(let i = 0; i < followingList.length; i++) {
        for(let j =0; j< accountList.length; j++){
            if(accountList[j].id == followingList[i].id){
                accountList.splice(j,1);
            }
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
                                    <button type="button" onClick = {unfollow.bind(this, userId, following.following_id)}>unfollow</button>
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
                                    <button type="button" onClick = {follow.bind(this, userId, account.user_id)}>follow</button>
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