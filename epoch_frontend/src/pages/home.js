import React, { useState, useEffect, useContext } from "react";
import "../styles/Login.css";
import { getUserInfo, removeSessionCookie } from "../services/user";
import { Spinner } from "../modules/Spinner";
import NavBar from "../modules/NavBar";import {useRef} from "react";
import {useNavigate} from "react-router-dom";
import Feed from "../modules/Feed";
import { UserContext } from '../services/UserContext';


function Home() {
    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useRef(true);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { updateUser } = useContext(UserContext);


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
      {<NavBar profilePic={user.profile_pic_data}/>}

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <h1>Home Page</h1>
          <h2>Hello {user.name}</h2>

          {user.profile_pic_data && (
            <img
              src={user.profile_pic_data}
              alt="Profile Pic"
              style={{ maxWidth: "300px" }}
            />
          )}

          <h2>Your user id is {user.id}</h2>
          <h2>Your username is {user.username}</h2>
          <h2>Your password is {user.password}</h2>
          <h2>Your account was created at {user.created_at}</h2>
          <h2>Your account bio is {user.bio}</h2>
          <h2>Your account profile pic id is {user.profile_pic_id}</h2>
        </>
      )}
        {/*<Feed />*/}
    </div>
  );
}

export default Home;
