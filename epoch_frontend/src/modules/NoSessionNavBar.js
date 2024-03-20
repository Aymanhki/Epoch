import React, {useState, useEffect, useContext} from "react";
import {NavLink} from "react-router-dom";
import "../styles/NavBar.css";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import {useNavigate} from "react-router-dom";
import SmartMedia from "./SmartMedia";

const NoSessionNavBar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    useEffect(() => {
        const closeDropdownOnOutsideClick = (event) => {
            const dropdown = document.querySelector(".dropdown");
            if (isDropdownOpen && !dropdown.contains(event.target)){
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("click", closeDropdownOnOutsideClick);

        return () => {
            document.removeEventListener("click", closeDropdownOnOutsideClick);
        };
    }, [isDropdownOpen]);

    return (
        <div className="navbar">
            <div className="left">
                <div className="logo-container" onClick={() => navigate('/epoch/home')}>
                    <img
                        src={process.env.PUBLIC_URL + "/images/epoch-logo-400.jpeg"}
                        alt="Epoch"
                        className="logo"
                        style={{width: "3rem", height: "100%", borderRadius: "50%"}}
                        onClick={() => navigate('/epoch/home')}
                    />
                    <span style={{textDecorationColor: "transparent"}}>Epoch</span>
                </div>

            </div>

            <div className="right">
                <NavLink to="/epoch/home" className="active">
                    <HomeOutlinedIcon/>
                </NavLink>

                <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`} onClick={toggleDropdown}>
                    <div className="navbar-profile-photo-container">
                    <SmartMedia
                                fileUrl={"https://storage.googleapis.com/epoch-cloud-storage-media/epoch-media/default_pfp.png"}
                                file_type={"image/png"}
                                alt="Profile"
                                className={"navbar-profile-photo"}
                            />
                    </div>

                    {((!isMobile && isDropdownOpen) || (isMobile)) &&


                        <div className="dropdown-content">
                            <span onClick={() => navigate('/epoch/register')}>Register</span>
                            <span onClick={() => navigate('/epoch/login')}>Login</span>
                        </div>
                    }
                </div>
            </div>

        </div>
    );
};

export default NoSessionNavBar;
