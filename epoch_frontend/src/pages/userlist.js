import {getUserInfo} from "../services/user";
import {getAccountList} from "../services/following"
import React, {useState, useEffect} from 'react';
import {Spinner} from '../modules/Spinner'

function Userlist() {
    // State variable for redirect
    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [followingList, setFollowingList] = useState({});
    const [accountList, setAccountList] = useState({});
/* 
    // Check for valid session cookie on component mount
    useEffect(() => {
        setIsLoading(true);
        getUserInfo()
            .then(data => {
                setRedirectToLogin(false);
                setUserInfo(data);
                setIsLoading(false);
            })
            .catch(error => {
                setRedirectToLogin(true);
                setIsLoading(false);
            });
    }, []);
 */
    useEffect(() => {
        setIsLoading(true);
        getAccountList()
            .then(data => {
                setRedirectToLogin(false);
                setAccountList(data);
                setIsLoading(false);
            })
            .catch(error => {
                setRedirectToLogin(true);
                setIsLoading(false);
            });
    }, []);

    // Redirect to home if redirectToHome is true
    if (redirectToLogin) {
        window.location.href = "/epoch/login";
        return <div><h2>User Not Signed In</h2></div>;
    }

    return (
        <div>
            {isLoading ? <Spinner/>: (
                <>
                    <h1>Userlist Page</h1>
                    <h2>{userInfo.name} you are following</h2>
                    <h2>list accounts im following</h2>
                    <h2>other accounts</h2>
                    <h2>list all other accounts</h2>
                    
                </>
            )}

        </div>
    );
}

export default Userlist;