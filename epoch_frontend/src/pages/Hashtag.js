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
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshFeed, setRefreshFeed] = useState(true);
    const {user, updateUser} = useContext(UserContext);
    const [showNewPostPopup, setShowNewPostPopup] = useState(false);
    const [hashtagName, setHashtagName] = useState(location.pathname.split('/hashtags/')[1]);
    const [hashtag, setHashtag] = useState(location.hash ? location.hash : '#' + hashtagName);
    const [showEmptyHashtag, setShowEmptyHashtag] = useState(false);

    const updatePosts = React.useCallback(() => {
        getAllHashtagPosts(hashtag)
            .then((newPosts) => {
                if (newPosts.length <= 0) {
                    setShowEmptyHashtag(true);
                } else {
                    setShowEmptyHashtag(false);
                }

                setPosts(newPosts);
                setIsLoading(false);
                setRefreshFeed(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
                setRefreshFeed(false);
            });
    }, [hashtag]);

    useEffect(() => {
        if (!user) {
            getUserInfo()
                .then((data) => {
                    updateUser(data);
                })
                .catch((error) => {
                    updateUser(null);
                });
        }
    }, [updateUser, user, setIsLoading]);

    useEffect(() => {
        if (refreshFeed) {
            setIsLoading(true);
            updatePosts();
        }
    }, [updatePosts, refreshFeed]);

    useEffect(() => {
        const newHashtag = location.hash ? location.hash : '#' + hashtagName;

        if (hashtag !== newHashtag) {
            setRefreshFeed(true);
            setIsLoading(true);
            setPosts([]);
            setHashtag(newHashtag);
            setHashtagName(location.pathname.split('/hashtags/')[1]);
        }
    }, [location.pathname, location.hash, hashtag, hashtagName]);

    return (
        <>
            {user && <NavBar profilePic={user.profile_pic_data} profilePicType={user.profile_pic_type}
                             showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup}/>}
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
                                      setRefreshFeed={setRefreshFeed} posts={posts}/>
                            ) : (
                                <Feed feedUsername={null} feedUserId={null} isInProfile={false} currentUser={null}
                                      showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup}
                                      refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed} viewingOnly={true}
                                      posts={posts}/>
                            )}
                            {showEmptyHashtag && <h1>No posts found for {hashtag}</h1>}
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
