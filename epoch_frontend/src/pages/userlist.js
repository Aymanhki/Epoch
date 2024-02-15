import {getUserInfo} from "../services/user";
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
    //const [redirectToLogin, setRedirectToLogin] = useState(false);
    //const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    //const [followingList, setFollowingList] = useState({});
    //const [accountList, setAccountList] = useState({});
    const [userList, setUserLists] = useState({});

    //on load get these lists from backend
    //my userId
    const userId = 69;

    getAccountList();
    getFollowingList();



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
            {isLoading ? <Spinner/>: (
                <>
                    <h1>Userlist Page</h1>
                    <h2>userInfo.name you are following</h2>
                    <h2>list accounts im following</h2>
                    <ul>
                        {followingList.map(following =>
                            <li key = {following.id}>
                                <p>
                                    <b>{following.username}: </b>
                                    &emsp; following 
                                </p>
                                <div>
                                    <button type="button" onClick = {unfollow.bind(this, userId, following.id)}>unfollow</button>
                                </div>
                            </li>
                            )}
                    </ul>
                    <h2>list all other accounts</h2>
                    <ul>
                        {accountList.map(account =>
                            <li key = {account.id}>
                                <p>
                                    <b>{account.username}: </b>
                                    &emsp; not following 
                                </p>
                                <div>
                                    <button type="button" onClick = {follow.bind(this, userId, account.id)}>follow</button>
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