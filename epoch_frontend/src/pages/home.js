import React, { useState, useEffect } from "react";
import "../styles/Login.css";
import { getUserInfo, removeSessionCookie } from "../services/user";
import { Spinner } from "../modules/Spinner";
import NavBar from "../modules/NavBar";
import {useRef} from "react";
import Post from "../modules/Post";
import {useNavigate} from "react-router-dom";

function Home() {
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
    const isMounted = useRef(true);
    const navigate = useNavigate();


    useEffect(() => {
        isMounted.current = true;

        setIsLoading(true);
        getUserInfo()
            .then(data => {
                if (isMounted.current) {
                    setRedirectToLogin(false);
                    setUserInfo(data);
                    setIsLoading(false);
                }
            })
            .catch(error => {
                if (isMounted.current) {
                    setRedirectToLogin(true);
                    setIsLoading(false);
                }
            });

        return () => { isMounted.current = false };
    }, [setIsLoading, setUserInfo, setRedirectToLogin]);

    const handleLogout = () => {
        removeSessionCookie();
        navigate('/epoch/login');
    }

    if (redirectToLogin && isMounted.current) {
        //window.location.href = "/epoch/login";
        navigate('/epoch/login');
        return <div><h2>User Not Signed In</h2></div>;
    }

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {<NavBar onLogout={handleLogout} />}
          <h1>Home Page</h1>
          <h2>Hello {userInfo.name}</h2>

          {userInfo.profile_pic_data && (
            <img
              src={userInfo.profile_pic_data}
              alt="Profile Pic"
              style={{ maxWidth: "300px" }}
            />
          )}

          <h2>Your user id is {userInfo.id}</h2>
          <h2>Your username is {userInfo.username}</h2>
          <h2>Your password is {userInfo.password}</h2>
          <h2>Your account was created at {userInfo.created_at}</h2>
          <h2>Your account bio is {userInfo.bio}</h2>
          <h2>Your account profile pic id is {userInfo.profile_pic_id}</h2>
          {<Post/>}
        </>
      )}
    </div>
  );
}

export default Home;
