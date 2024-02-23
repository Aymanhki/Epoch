import React, { useState, useEffect, useContext } from "react";
import "../styles/Login.css";
import { getUserInfo, removeSessionCookie } from "../services/user";
import { Spinner } from "../modules/Spinner";
import NavBar from "../modules/NavBar";import {useRef} from "react";
import {useNavigate} from "react-router-dom";
import Feed from "../modules/Feed";
import { UserContext } from '../services/UserContext';
import '../styles/Home.css';


function Home() {
    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useRef(true);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { updateUser } = useContext(UserContext);
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);


    useEffect(() => {
        if (!user) {
             setIsLoading(true);
            getUserInfo()
                .then(data => {
                        setRedirectToLogin(false);
                        updateUser(data);
                        setIsLoading(false);

                })
                .catch(error => {
                        setRedirectToLogin(true);
                        setIsLoading(false);
                        updateUser(null);
                });
             setIsLoading(false);
        }

        setIsLoading(false);
    }, [setIsLoading, setRedirectToLogin, updateUser, user]);



    if (redirectToLogin && isMounted.current) {
        //window.location.href = "/epoch/login";
        navigate('/epoch/login');
        return <div><h2>User Not Signed In</h2></div>;
    }

    if(!user) {
        return <Spinner />
    }

  return (
    <div>
      {<NavBar profilePic={user.profile_pic_data } showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup}/>}

      {isLoading ? (
        <Spinner />
      ) : (
        <>
            <div className="home-page-container">
                <div className="home-feed-wrapper">
                    <div className="home-feed" data-testid={"home-feed"} id={"home-feed"} >
                        <Feed feedUsername={user.username} feedUserId={user.id} isInProfile={false} currentUser={user} showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup}/>
                    </div>
                </div>
            </div>
        </>
      )}
        {/*<Feed />*/}
    </div>
  );
}

export default Home;
