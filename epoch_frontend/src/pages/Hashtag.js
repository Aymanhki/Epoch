import {useLocation} from 'react-router-dom';
import React, {useContext, useEffect} from 'react';
import {getAllHashtagPosts} from '../services/post';
import {getUserInfo} from '../services/user';
import Feed from '../modules/Feed';
import {Spinner} from '../modules/Spinner';
import {useState} from 'react';
import '../styles/Hashtag.css';
import {UserContext} from '../services/UserContext';
import NavBar from '../modules/NavBar';
import PostPopup from '../modules/PostPopup';

function Hashtag() {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshFeed, setRefreshFeed] = useState(true);
    const {user, updateUser} = useContext(UserContext);
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const [hashtagName, setHashtagName] = useState(location.pathname.split('/hashtags/')[1]);
    const [hashtag, setHashtag] = useState(location.hash ? location.hash : '#' + hashtagName);

    useEffect(() => {
        if (!user) {
            getUserInfo()
                .then((data) => {
                    updateUser(data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    updateUser(null);
                    setIsLoading(false);
                });
        }
    }, [updateUser, user, setIsLoading]);

    useEffect(() => {
        const newHashtag = location.hash ? location.hash : '#' + hashtagName;

        if (hashtag !== newHashtag) {
            setRefreshFeed(true);
            setIsLoading(true);
            setHashtag(newHashtag);
            setHashtagName(location.pathname.split('/hashtags/')[1]);
        }

    }, [location.pathname, location.hash, hashtag, hashtagName]);

    return (
        <>
            {user && <NavBar profilePic={user.profile_pic_data} profilePicType={user.profile_pic_type}
                             showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup} userId={user.id}/>}
            {isLoading ? (
                <Spinner/>
            ) : (
                <div className={'hashtag-page-container'}>
                    <div className={'hashtag-feed-wrapper'}>
                        <div className={'hashtag-feed'}>
                            {user ? (
                                <Feed feedUsername={user.username} feedUserId={user.id} isInProfile={false}
                                      currentUser={user} showNewPostPopup={showNewPostPopup}
                                      setShowNewPostPopup={setShowNewPostPopup} refreshFeed={refreshFeed}
                                      setRefreshFeed={setRefreshFeed} posts={null} isInFavorites={false} hashtag={hashtag} isInHashtags={true}/>
                            ) : (
                                <Feed feedUsername={null} feedUserId={null} isInProfile={false} currentUser={null}
                                      showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup}
                                      refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed} viewingOnly={true}
                                      posts={null} isInFavorites={false} isInHashtags={true} hashtag={hashtag}/>
                            )}
                        </div>
                    </div>

                    {user != null && <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup}
                                                username={user.username} profilePic={user.profile_pic_data}
                                                refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed}/>}
                </div>
            )}
        </>
    );
}

export default Hashtag;
