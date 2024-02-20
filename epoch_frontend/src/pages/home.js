import React, {useState, useEffect} from 'react';
import '../styles/Login.css';
import {getUserInfo} from '../services/user'
import {Spinner} from '../modules/Spinner'
import home from '../styles/home.css'
import Feed from '../modules/Feed.jsx'
// import leftBar from '../styles/leftBar.css'
// import rightBar from '../styles/rightBar.css'



function Home() {

    // State variable for redirect
    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);


    // Check for valid session cookie on component mount
    // useEffect(() => {
    //     setIsLoading(true);
    //     getUserInfo()
    //         .then(data => {
    //             setRedirectToLogin(false);
    //             setUserInfo(data);
    //             setIsLoading(false);
    //         })
    //         .catch(error => {
    //             setRedirectToLogin(true);
    //             setIsLoading(false);
    //         });
    // }, []);

    // Redirect to home if redirectToHome is true
    // if (redirectToLogin) {
    //     window.location.href = "/epoch/login";
    //     return <div><h2>User Not Signed In</h2></div>;
    // }

    return (
        <div>
            {isLoading && <Spinner/>}
            {/* TopBar goes here  */}
            <div className='homeContainer'>
                
                <Feed/>
                
            </div>
            
        </div>
    );
}

export default Home;
/*
<div className='leftPadding'></div>
<div className='rightPadding'></div>
*/