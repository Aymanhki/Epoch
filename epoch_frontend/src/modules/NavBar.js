import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/NavBar.css";
import { getUserInfo } from "../services/user";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

const NavBar = ({ onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        if (userInfo && userInfo.profile_pic_data) {
          setUserProfilePhoto(userInfo.profile_pic_data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="navbar">
      <div className="left">
        <div className="logo-container">
          <img
            src="../images/epoch-logos-96.jpeg"
            alt="Epoch"
            className="logo"
          />
          <span>Epoch</span>
        </div>
        <NavLink to="/epoch/home" activeClassName="active">
          <HomeOutlinedIcon />
        </NavLink>
        <NavLink to="/epoch/post" activeClassName="active">
          <PostAddOutlinedIcon />
        </NavLink>
        <NavLink to="/epoch/search" activeClassName="active">
          <div className="search-bar">
            <SearchOutlinedIcon className="search-icon" />
            <input type="text" placeholder="Search" />
          </div>
        </NavLink>
      </div>
      <div className="right">
        <div className="dropdown" onClick={toggleDropdown}>
          {userProfilePhoto ? (
            <img
              src={userProfilePhoto}
              alt="Profile"
              className="profile-photo"
            />
          ) : (
            <AccountCircleOutlinedIcon />
          )}
          {isDropdownOpen && (
            <div className="dropdown-content">
              <span onClick={onLogout}>Logout</span>
              <NavLink to="/epoch/profile" activeClassName="active">
                Profile
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
