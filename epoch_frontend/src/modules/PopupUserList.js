import {animated, useSpring} from "react-spring";
import React from "react";
import {useNavigate} from "react-router-dom";
import '../styles/PopupUserList.css';
import ArrowCircleUpSharpIcon from '@mui/icons-material/ArrowCircleUpSharp';
import ArrowCircleDownSharpIcon from '@mui/icons-material/ArrowCircleDownSharp';


function PopupUserList({showUserListModal, setShowUserListModal, popupList}) {

    const navigate = useNavigate();

    const {transform: inTransform} = useSpring({
        transform: `translateY(${showUserListModal ? 0 : 100}vh)`,
        config: {duration: 300},
    });

    const {transform: outTransform} = useSpring({
        transform: `translateY(${showUserListModal ? 0 : -100}vh)`,
        config: {duration: 300},
    });

    return (
        <animated.div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: showUserListModal ? inTransform : outTransform,
                zIndex: 1000
            }}
        >
            <div className="modal-overlay" onClick={() => setShowUserListModal(false)}></div>

            <div className="user-list-modal">
                <ul className="popup-user-list">
                    {popupList && popupList.map && popupList.map(account =>
                        <li key={account.user_id} className="popup-list-item">
                            <p className="username"
                               onClick={() => navigate('/epoch/' + account.username)}>@{account.username}</p>
                            {(account.vote) && (<div className="user-list-vote-icon">
                                {account.vote === 1 ? <ArrowCircleUpSharpIcon className={"user-list-upvote-icon"} /> :
                                    <ArrowCircleDownSharpIcon className={"user-list-downvote-icon"} />}
                            </div>)}
                        </li>
                    )}
                </ul>
            </div>

        </animated.div>
    )
}

export default PopupUserList;