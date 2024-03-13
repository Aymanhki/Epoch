import {fillUserList} from "../services/following";
import React, {useState, useEffect, useContext} from 'react';
import {useNavigate} from "react-router-dom";
import {Spinner} from '../modules/Spinner'
import NavBar from "../modules/NavBar";
import {UserContext} from "../services/UserContext";
import {TextField} from "@mui/material";
import '../styles/UserList.css'
import PostPopup from "../modules/PostPopup";
import UserListModule from "../modules/UserListModule";

function Userlist() {
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState({});
    const [filteredList, setFilteredList] = useState(null);
    const [changedStatus, changeStatus] = useState(false);
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const [refreshFeed, setRefreshFeed] = useState(false);
    const {user} = useContext(UserContext);
    const {updateUser} = useContext(UserContext);
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState("");
    const [darkMode, setDarkMode] = useState(false);


    let handleChange = (event) => {
        setSearchInput(event.target.value.toLowerCase());
    };

    useEffect(() => {
        setIsLoading(true);
        if (!user) {
            updateUser(null);
        }
        fillUserList()
            .then(data => {
                setUserList(data);
                setIsLoading(false);
                changeStatus(false);
            })
            .catch(error => {
                setIsLoading(false);
                console.log("Error fetching following list:", error);
                navigate('/epoch/profile/');
            });
    }, [setUserList, navigate, updateUser, user, setIsLoading]);

    useEffect(() => {
        changeStatus(false);
    }, [changeStatus]);

    useEffect(() => {
        if (searchInput === '') {
            setFilteredList(null);
        } else {
            var tempFiltered = [];

            for (var i in userList) {
                if (userList[i].username.toLowerCase().includes(searchInput)) {
                    tempFiltered.push(userList[i]);
                }
            }
            setFilteredList(tempFiltered);
        }
        changeStatus(!changedStatus);
    }, [searchInput, changedStatus, filteredList, userList]);

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
            {!user ? (navigate('/epoch/home/')) : (
                isLoading ? <Spinner/> : (
                    <>
                        <NavBar profilePic={user.profile_pic_data} profilePicType={user.profile_pic_type}
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
                                {filteredList ? <UserListModule userList={filteredList}/> : <UserListModule userList={userList}/>}
                                
                                
                            </div>
                        </div>
                        <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup}
                                   username={user.username} profilePic={user.profile_pic_data} refreshFeed={refreshFeed}
                                   setRefreshFeed={setRefreshFeed}/>

                    </>
                )
            )}
        </>
    );
}

export default Userlist;
