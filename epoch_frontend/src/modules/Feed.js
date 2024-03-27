import React, {useState, useEffect} from 'react';
import '../styles/Feed.css';
import {Spinner} from "./Spinner";
import Post from "./Post";
import {getAllUserPosts, getFollowedUsersPost} from '../services/post.js'
import { useRef } from 'react';
import { ViewportList } from 'react-viewport-list';


export default function Feed({
                                 feedUsername,
                                 feedUserId,
                                 isInProfile,
                                 currentUser,
                                 showNewPostPopup,
                                 setShowNewPostPopup,
                                 refreshFeed,
                                 setRefreshFeed,
                                 viewingOnly,
                                 posts,
                                 isInFavorites
                             }) {

    const [isLoading, setIsLoading] = useState(true);
    const [feedPosts, setFeedPosts] = useState(Array(10).fill(null));
    const ref = useRef(null);

    const refreshFeedPosts = React.useCallback(async () => {
        if (!posts) {
            if (currentUser) {
                if (isInProfile && feedUserId && currentUser.id === feedUserId) {
                    getAllUserPosts(currentUser.id).then((data) => {
                        setFeedPosts(data.sort((a, b) => new Date(b.release) - new Date(a.release)));
                        setIsLoading(false);
                    }).catch((error) => {
                        console.error(error);
                        setIsLoading(false);
                    });
                } else if (feedUserId && currentUser.id !== feedUserId) {
                    getAllUserPosts(feedUserId).then((data) => {
                        setFeedPosts(data.sort((a, b) => new Date(b.release) - new Date(a.release)));
                        setIsLoading(false);
                    }).catch((error) => {
                        console.error(error);
                        setIsLoading(false);
                    });
                } else if (!isInProfile && feedUsername && currentUser.username === feedUsername) {
                    getFollowedUsersPost(currentUser.id).then((data) => {
                        setFeedPosts(data.sort((a, b) => new Date(b.release) - new Date(a.release)));
                        setIsLoading(false);
                    }).catch((error) => {
                        console.error(error);
                        setIsLoading(false);
                    });
                }
            } else {
                if (feedUserId) {
                    getAllUserPosts(feedUserId).then((data) => {
                        setFeedPosts(data.sort((a, b) => new Date(b.release) - new Date(a.release)));
                        setIsLoading(false);
                    }).catch((error) => {
                        console.error(error);
                        setIsLoading(false);
                    });
                }
            }
        } else {
            setFeedPosts(posts.sort((a, b) => new Date(b.release) - new Date(a.release)));
            setIsLoading(false);
        }
        setRefreshFeed(false);
    }, [feedUserId, feedUsername, currentUser, isInProfile, posts, setRefreshFeed]);

    useEffect(() => {
        refreshFeedPosts();
    }, [feedUserId, feedUsername, currentUser, isInProfile, refreshFeedPosts]);

    useEffect(() => {
        if (refreshFeed) {
            setIsLoading(true);
            refreshFeedPosts();
        }
    }, [refreshFeed, refreshFeedPosts]);

    return (
        <>
            {isLoading ? (<Spinner/>) :
                (
                    <div className={'feed-wrapper'}>

                        <div className={'posts-wrapper'}>
                            {feedPosts.length === 0 &&
                                <div className={'no-posts'}>No posts to show, follow some people or make a new
                                    post</div>}
                                    
                            {feedPosts.length > 0 &&
                            <div className="scroll-container" ref={ref}>
                                <ViewportList viewportRef={ref} items={feedPosts} >
                                    {(item) => (
                                        <Post key={item.post_id} post={item} postViewer={currentUser} refreshFeed={refreshFeed}
                                                    setRefreshFeed={setRefreshFeed} isInFavorites={isInFavorites}/>
                                    )}
                                </ViewportList>
                            </div>}

                        </div>

                        {(currentUser && ((!isInProfile && feedUsername && currentUser.username === feedUsername) || (isInProfile && feedUserId && currentUser.id === feedUserId)) && !viewingOnly) && (
                            <button className={`new-post-button ${showNewPostPopup ? 'rotate' : ''}`}
                                    onClick={() => setShowNewPostPopup(!showNewPostPopup)}>+</button>)}

                    </div>)}
        </>
    )
}
