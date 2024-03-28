import React, {useState, useEffect} from 'react';
import '../styles/Feed.css';
import {Spinner} from "./Spinner";
import Post from "./Post";
import {getAllUserPosts, getFollowedUsersPost, getAllHashtagPosts} from '../services/post.js'
import {useRef} from "react";


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
                                 isInFavorites,
                                 isInHashtags,
                                 hashtag
                             }) {

    const [isLoading, setIsLoading] = useState(true);
    const [feedPosts, setFeedPosts] = useState([]);
    const [noMorePosts, setNoMorePosts] = useState(false);
    const [firstRender, setFirstRender] = useState(true);
    const [ref, setRef] = useState(useRef(null));
    const [loadingTop, setLoadingTop] = useState(true);
    const [topOffset, setTopOffset] = useState(0);
    const [allowScrollToTop, setAllowScrollToTop] = useState(false);
    const [noMoreTopPosts, setNoMoreTopPosts] = useState(false);
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(20); // must be bigger tha maxPosts
    const maxPosts = 25;
    const toRemove = 15; // Must be smaller than maxPosts

    const refreshFeedPosts =  (reset, fromTop) =>
    {
        let finalOffset = reset ? 0 : (fromTop ? topOffset : offset);
        let finalFeedPosts = reset ? [] : feedPosts;

        if (reset) {
            setFeedPosts([]);
            setNoMorePosts(false);
            setNoMoreTopPosts(false);
            setAllowScrollToTop(false);
            setTopOffset(0);
        }

        if (!posts)
        {
            if (isInHashtags && hashtag)
            {
                getAllHashtagPosts(hashtag, finalOffset, limit)
                .then((data) =>
                {
                    if (!fromTop)
                    {
                        onNewBottomPosts(data, finalFeedPosts, finalOffset);
                    }
                    else
                    {
                        onNewTopPosts(data, finalFeedPosts, finalOffset);
                    }
                })
                .catch((error) =>
                {
                    console.log(error);

                    if(!fromTop)
                    {
                        setIsLoading(false);
                    }
                    else
                    {
                        setLoadingTop(false);
                    }
                });
            }
            else if (currentUser)
            {
                if (isInProfile && feedUserId && currentUser.id === feedUserId)
                {
                    getAllUserPosts(currentUser.id, finalOffset, limit)
                    .then((data) =>
                    {
                        if (!fromTop)
                        {
                            onNewBottomPosts(data, finalFeedPosts, finalOffset);
                        }
                        else
                        {
                            onNewTopPosts(data, finalFeedPosts, finalOffset);
                        }
                    })
                    .catch((error) =>
                    {
                        console.log(error);

                        if(!fromTop)
                        {
                            setIsLoading(false);
                        }
                        else
                        {
                            setLoadingTop(false);
                        }
                    });
                }
                else if (feedUserId && currentUser.id !== feedUserId)
                {
                    getAllUserPosts(feedUserId, finalOffset, limit)
                    .then((data) =>
                    {
                        if (!fromTop)
                        {
                            onNewBottomPosts(data, finalFeedPosts, finalOffset);
                        }
                        else
                        {
                            onNewTopPosts(data, finalFeedPosts, finalOffset);
                        }
                    })
                    .catch((error) =>
                    {
                        console.log(error);

                        if(!fromTop)
                        {
                            setIsLoading(false);
                        }
                        else
                        {
                            setLoadingTop(false);
                        }
                    });
                }
                else if (!isInProfile && feedUsername && currentUser.username === feedUsername)
                {
                    getFollowedUsersPost(currentUser.id, finalOffset, limit)
                    .then((data) =>
                    {
                        if (!fromTop)
                        {
                            onNewBottomPosts(data, finalFeedPosts, finalOffset);
                        }
                        else
                        {
                            onNewTopPosts(data, finalFeedPosts, finalOffset);
                        }
                    })
                    .catch((error) =>
                    {
                        console.log(error);

                        if(!fromTop)
                        {
                            setIsLoading(false);
                        }
                        else
                        {
                            setLoadingTop(false);
                        }
                    });
                }
            }
            else
            {
                if (feedUserId)
                {
                    getAllUserPosts(feedUserId, finalOffset, limit)
                    .then((data) =>
                    {
                        if (!fromTop)
                        {
                            onNewBottomPosts(data, finalFeedPosts, finalOffset);
                        }
                        else
                        {
                            onNewTopPosts(data, finalFeedPosts, finalOffset);
                        }
                    })
                    .catch((error) =>
                    {
                        console.log(error);

                        if(!fromTop)
                        {
                            setIsLoading(false);
                        }
                        else
                        {
                            setLoadingTop(false);
                        }
                    });
                }
            }
        }
        else
        {
            if (!fromTop)
            {
                setIsLoading(false);
            }
            else
            {
                setLoadingTop(false);
            }

            setFeedPosts(posts);
        }

        setRefreshFeed(false);
    }

    const onNewBottomPosts = (data, finalFeedPosts, finalOffset) =>
    {
        let finalToSetFeedPosts = finalFeedPosts;

        if (data.length + finalFeedPosts.length > maxPosts)
        {
            finalToSetFeedPosts = finalToSetFeedPosts.slice(toRemove);
            finalToSetFeedPosts = finalToSetFeedPosts.concat(data);
            let newTopOffset = (offset - limit - limit + (maxPosts - limit)) < 0 ? 0 : (offset - limit - limit + (maxPosts - limit));
            setTopOffset(newTopOffset);
            setAllowScrollToTop(true);
        }
        else
        {
            finalToSetFeedPosts = finalToSetFeedPosts.concat(data);
        }

        setFeedPosts(finalToSetFeedPosts);

        if (data.length < limit)
        {
            setNoMorePosts(true);
        }

        setOffset(finalOffset + limit)
        setIsLoading(false);
        setLoadingTop(false);
    }

    const onNewTopPosts = (data, finalFeedPosts, finalOffset) =>
    {
        let finalToSetFeedPosts = finalFeedPosts;

        if (data.length + finalFeedPosts.length > maxPosts)
        {
            finalToSetFeedPosts = finalToSetFeedPosts.slice(0, (limit));
            finalToSetFeedPosts = data.concat(finalToSetFeedPosts);

            if (noMoreTopPosts)
            {
                setOffset(topOffset - limit - limit);
            }
            else
            {
                setOffset(topOffset - limit - limit);
            }

            setNoMorePosts(false);
        }
        else
        {
            finalToSetFeedPosts = data.concat(finalToSetFeedPosts);
        }

        setFeedPosts(finalToSetFeedPosts);

        if (topOffset <= 0 || data.length < limit)
        {
            setNoMoreTopPosts(true);
            setAllowScrollToTop(false);
        }

        setTopOffset((finalOffset - limit) < 0 ? 0 : (finalOffset - limit));
        setLoadingTop(false);
        setIsLoading(false);
    }

    useEffect(() => {
        if (firstRender) {
            refreshFeedPosts(true, false);
            setFirstRender(false);
        }
    });

    useEffect(() => {
        if (refreshFeed) {
            setIsLoading(true);
            refreshFeedPosts(true, false);
        }
    }, [refreshFeed, refreshFeedPosts]);

    window.onscroll = () => {
        if ((window.innerHeight + document.documentElement.scrollTop) >= document.documentElement.offsetHeight) {
            if (!noMorePosts && !isLoading) {
                setIsLoading(true);
                refreshFeedPosts(false, false);
            }
        }
    }

    return (
        <>
            {(isLoading && loadingTop) ? <Spinner className={'feed-loading'}/> : (
                <div className={'feed-wrapper'}>
                {loadingTop && <Spinner className={'feed-loading'}/>}

                <div className={'posts-wrapper'}>
                    {(!loadingTop && allowScrollToTop && !noMoreTopPosts) && (
                        <div className={'load-more-top-buttons-wrapper'}>
                            <button className={'reset-feed-button'} onClick={() => {
                                setLoadingTop(true);
                                setIsLoading(true);
                                refreshFeedPosts(true, false);
                            }}>Refresh feed (top)</button>

                            {/*<button className={'load-previous-posts-button'} onClick={() => {*/}
                            {/*    setLoadingTop(true);*/}
                            {/*    refreshFeedPosts(false, true);*/}
                            {/*}}>Load previous posts*/}
                            {/*</button>*/}
                        </div>
                    )}

                    {(feedPosts.length === 0 && !isLoading) &&
                        <div className={'no-posts'}>No posts to show, follow some people or make a new post</div>}

                    {feedPosts.length > 0 && (
                        feedPosts.map((item) => (
                            <Post key={item.post_id} post={item} postViewer={currentUser} refreshFeed={refreshFeed}
                                  setRefreshFeed={setRefreshFeed} isInFavorites={isInFavorites}/>
                        ))
                    )}

                    {noMorePosts && <h3 className={'no-more-posts'}>No more posts to show</h3>}
                </div>

                {(currentUser && ((!isInProfile && feedUsername && currentUser.username === feedUsername) || (isInProfile && feedUserId && currentUser.id === feedUserId)) && !viewingOnly) && (
                    <button className={`new-post-button ${showNewPostPopup ? 'rotate' : ''}`}
                            onClick={() => setShowNewPostPopup(!showNewPostPopup)}>+</button>)}

                {isLoading && (<Spinner className={'feed-loading'}/>)}
            </div>
            )}
        </>
    )
}
