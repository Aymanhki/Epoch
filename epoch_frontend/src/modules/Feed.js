import React, {useContext, useState} from 'react';
import '../styles/Feed.css';
import {Spinner} from "./Spinner";
import PostPopup from "./PostPopup";



export default function Feed({feedUsername, isInProfile, currentUser}) {
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);


    return (
        <>
        {isLoading ? (<Spinner/>) :
            (<div className="feed">
                <button className={`floatingPostButton ${showNewPostPopup ? 'rotate' : ''}`} onClick={() => setShowNewPostPopup(true)}>+</button>
                <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup} username={currentUser.username} profilePic={currentUser.profile_pic_data}/>
            </div>)}
        </>
    )
}
