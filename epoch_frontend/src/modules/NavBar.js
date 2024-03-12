import React, {useState, useEffect, useContext} from "react";
import {NavLink} from "react-router-dom";
import "../styles/NavBar.css";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import {useNavigate} from "react-router-dom";
import {removeSessionCookie} from "../services/user";
import {UserContext} from "../services/UserContext";
import SmartMedia from "./SmartMedia";
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';


const NavBar = ({profilePic, profilePicType, showNewPostPopup, setShowNewPostPopup}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const {updateUser} = useContext(UserContext);


    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    useEffect(() => {
        const closeDropdownOnOutsideClick = (event) => {
            if (isDropdownOpen && !event.target.closest(".dropdown")) {
                setIsDropdownOpen(false);
            }
        };

        document.body.addEventListener("click", closeDropdownOnOutsideClick);

        return () => {
            document.body.removeEventListener("click", closeDropdownOnOutsideClick);
        };
    }, [isDropdownOpen]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleLogout = () => {
        removeSessionCookie();
        updateUser(null);
        navigate('/epoch/login');
    }

    return (
        <div className="navbar">
            <div className="left">
                <div className="logo-container" onClick={() => navigate('/epoch/home')}>
                    <img
                        src={process.env.PUBLIC_URL + "/images/epoch-logo-400.jpeg"}
                        alt="Epoch"
                        className="logo"
                        style={{width: "3rem", height: "100%"}}
                        onClick={() => navigate('/epoch/home')}
                    />
                    <span style={{textDecorationColor: "transparent"}}>Epoch</span>
                </div>

            </div>

            <div className="right">
                <NavLink to="/epoch/home" className="active">
                    <HomeOutlinedIcon/>
                </NavLink>

                <NavLink className="active" onClick={() => {
                    if (showNewPostPopup) {
                        setShowNewPostPopup(false);
                    } else {
                        setShowNewPostPopup(true);
                    }
                }}>
                    <PostAddOutlinedIcon/>
                </NavLink>

                <NavLink to="/epoch/favorites" className="active">
                    <FavoriteBorderOutlinedIcon/>
                </NavLink>

                <NavLink to="/epoch/search" className="active">
                    <SearchOutlinedIcon className="search-icon"/>
                </NavLink>

                <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`} onClick={toggleDropdown}>
                    <div className="navbar-profile-photo-container">
                        {profilePic ? (
                            <SmartMedia
                                fileUrl={profilePic}
                                file_type={profilePicType}
                                alt="Profile"
                                className={"navbar-profile-photo"}
                            />
                        ) : (
                            <div>
                                <AccountCircleOutlinedIcon/>
                            </div>
                        )}
                    </div>

                    {((!isMobile && isDropdownOpen) || (isMobile)) &&


                        <div className="dropdown-content">
                            <span onClick={() => handleLogout()}>Logout</span>
                            <span onClick={() => navigate('/epoch/profile')}>Profile</span>
                        </div>
                    }


                </div>
            </div>

        </div>
    );
};

export default NavBar;
