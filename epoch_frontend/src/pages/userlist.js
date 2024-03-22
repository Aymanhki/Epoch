import {fillUserList} from "../services/following";
import {getUserInfo} from '../services/user';
import React, {useState, useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import {Spinner} from '../modules/Spinner'
import NavBar from "../modules/NavBar";
import {TextField} from "@mui/material";
import '../styles/UserList.css'
import PostPopup from "../modules/PostPopup";
import UserListModule from "../modules/UserListModule";

function Userlist() {
    const [isLoading, setIsLoading] = useState(false);
    const [fullUserList, setFullUserList] = useState({});
    const [filteredList, setFilteredList] = useState({});
    const [changedStatus, changeStatus] = useState(false);
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const [refreshFeed, setRefreshFeed] = useState(false);
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    let reloadUser = false;

    let handleChange = (event) => {
        setSearchInput(event.target.value.toLowerCase());
    };

    useEffect(() => {
        setIsLoading(true);
            getUserInfo()
                .then(data => {
                    setUserInfo(data);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.log("Error fetching user info:", error);
                    setIsLoading(false);

                });
    },[reloadUser])

    useEffect(() => {
        setIsLoading(true);
        fillUserList()
            .then(data => {
                setFullUserList(data);
                setIsLoading(false);
                changeStatus(false);
            })
            .catch(error => {
                setIsLoading(false);
                console.log("Error fetching following list:", error);
                navigate("/epoch/home");
            });
    }, [setFullUserList, navigate,  setIsLoading]);

    useEffect(() => {
        changeStatus(false);
    }, [changeStatus]);

    useEffect(() => {
        if (searchInput === '') {
            setFilteredList([]);
        } else {
            var tempFiltered = [];

            for (var i in fullUserList) {
                if (fullUserList[i].username.toLowerCase().includes(searchInput)) {
                    tempFiltered.push(fullUserList[i]);
                }
            }
            setFilteredList(tempFiltered);
        }
        changeStatus(!changedStatus);
    }, [searchInput, changedStatus, filteredList, fullUserList]);


    useEffect(() => {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setDarkMode(darkModeMediaQuery.matches);

        const darkModeChangeListener = (e) => setDarkMode(e.matches);
        darkModeMediaQuery.addEventListener('change', darkModeChangeListener);

        return () => {
            darkModeMediaQuery.removeEventListener('change', darkModeChangeListener);
        };
    }, []);

    return (
        <>
            {userInfo ? (

                isLoading ? <Spinner/> : (
                    <>

                    <NavBar profilePic={userInfo.profile_pic_data} profilePicType={userInfo.profile_pic_type}
                                showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup}/>

                            <div className={"user-list-page"}>

                                <div className="user-list-container">



                                    <div className="user-list-search-bar-container">

                                        <TextField className="list-search-bar"
                                                label="Search users.."
                                                variant="outlined"
                                                onChange={handleChange}
                                                value={searchInput}
                                                InputProps={{style: {width: "100%"}}}
                                                sx={{
                                                    input: {
                                                        color: darkMode ? 'white' : '#1a2a6c', // Change color based on dark mode
                                                    }
                                                }}
                                        />

                                    </div>

                                    { (filteredList.length > 0 || searchInput.length > 0) ? (<UserListModule userList={filteredList}/>) : (<UserListModule userList={fullUserList}/>) }
                                    
                                </div>

                            <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup}
                                    username={userInfo.username} profilePic={userInfo.profile_pic_data} refreshFeed={refreshFeed}
                                    setRefreshFeed={setRefreshFeed}/>
                                    
                            </div>


                </>
                )
            ):(reloadUser=!reloadUser)}
        </>
    );
}

export default Userlist;
