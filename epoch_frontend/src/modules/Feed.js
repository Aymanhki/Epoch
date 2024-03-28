import React, {useState, useEffect} from 'react';
import '../styles/Feed.css';
import {Spinner} from "./Spinner";
import Post from "./Post";
import {getAllUserPosts, getFollowedUsersPost, getAllHashtagPosts} from '../services/post.js'
import { ViewportList } from 'react-viewport-list';
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
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(30);
    const [noMorePosts, setNoMorePosts] = useState(false);
    const [firstRender, setFirstRender] = useState(true);
    const [ref, setRef] = useState(useRef(null));
    const [loadingTop, setLoadingTop] = useState(false);
    const [topOffset, setTopOffset] = useState(0);
    const [allowScrollToTop, setAllowScrollToTop] = useState(false);
    const [noMoreTopPosts, setNoMoreTopPosts] = useState(false);
    const [removeTop, setRemoveTop] = useState(false);
    const maxPosts = 50;
    const toRemove = 10;


    const refreshFeedPosts =  (reset, fromTop) => {
        let finalOffset = reset ? 0 : (fromTop ? topOffset : offset);
        let finalFeedPosts = reset ? [] : feedPosts;

        if (reset) {
            setFeedPosts([]);
            setOffset(0);
            setNoMorePosts(false);
            setNoMoreTopPosts(false);
            setAllowScrollToTop(false);
            setRemoveTop(false);
            setTopOffset(0);
        }

        if (!posts) {
            if (isInHashtags && hashtag) {
                getAllHashtagPosts(hashtag, finalOffset, limit).then((data) => {

                    if (!fromTop) {
                        setFeedPosts(finalFeedPosts.concat(data));

                        if (data.length < limit) {
                            setNoMorePosts(true);
                        }

                        setRemoveTop(true);
                        setOffset(finalOffset + limit)
                        setIsLoading(false);
                    } else {
                        setFeedPosts(data.concat(finalFeedPosts));

                        if (topOffset <= 0) {
                            setNoMoreTopPosts(true);
                            setAllowScrollToTop(false);
                        }

                        setRemoveTop(false);
                        setTopOffset(finalOffset - limit)
                        setLoadingTop(false);
                    }

                }).catch((error) => {
                    console.error(error);

                    if(!fromTop) {
                        setIsLoading(false);
                    } else {
                        setLoadingTop(false);
                    }

                });
            } else if (currentUser) {
                if (isInProfile && feedUserId && currentUser.id === feedUserId) {
                    getAllUserPosts(currentUser.id, finalOffset, limit).then((data) => {

                        if (!fromTop) {
                            setFeedPosts(finalFeedPosts.concat(data));
                            setOffset(finalOffset + limit)

                            if (data.length < limit) {
                                setNoMorePosts(true);
                            }

                            setRemoveTop(true);
                            setIsLoading(false);
                        } else {
                            setFeedPosts(data.concat(finalFeedPosts));
                            setTopOffset(finalOffset - limit);

                            if (data.length < limit) {
                                setNoMoreTopPosts(true);
                                setAllowScrollToTop(false);
                            }

                            setRemoveTop(false);
                            setLoadingTop(false);
                        }

                    }).catch((error) => {
                        console.error(error);

                        if(!fromTop) {
                            setIsLoading(false);
                        } else {
                            setLoadingTop(false);
                        }
                    });
                } else if (feedUserId && currentUser.id !== feedUserId) {
                    getAllUserPosts(feedUserId, finalOffset, limit).then((data) => {

                        if (!fromTop) {
                            setFeedPosts(finalFeedPosts.concat(data));
                            setOffset(finalOffset + limit)

                            if (data.length < limit) {
                                setNoMorePosts(true);
                            }

                            setRemoveTop(true);
                            setIsLoading(false);
                        } else {
                            setFeedPosts(data.concat(finalFeedPosts));
                            setTopOffset(finalOffset - limit);

                            if (data.length < limit) {
                                setNoMoreTopPosts(true);
                                setAllowScrollToTop(false);
                            }

                            setRemoveTop(false);
                            setLoadingTop(false);
                        }
                    }).catch((error) => {
                        console.error(error);

                        if(!fromTop) {
                            setIsLoading(false);
                        } else {
                            setLoadingTop(false);
                        }
                    });
                } else if (!isInProfile && feedUsername && currentUser.username === feedUsername) {
                    getFollowedUsersPost(currentUser.id, finalOffset, limit).then((data) => {


                        if (!fromTop) {
                            setFeedPosts(finalFeedPosts.concat(data));
                            setOffset(finalOffset + limit)

                            if (data.length < limit) {
                                setNoMorePosts(true);
                            }

                            setRemoveTop(true);
                            setIsLoading(false);
                        } else {
                            setFeedPosts(data.concat(finalFeedPosts));
                            setTopOffset(finalOffset - limit);

                            if (data.length < limit) {
                                setNoMoreTopPosts(true);
                                setAllowScrollToTop(false);
                            }

                            setRemoveTop(false);
                            setLoadingTop(false);
                        }

                    }).catch((error) => {
                        console.error(error);

                        if(!fromTop) {
                            setIsLoading(false);
                        } else {
                            setLoadingTop(false);
                        }
                    });
                }
            } else {
                if (feedUserId) {
                    getAllUserPosts(feedUserId, finalOffset, limit).then((data) => {


                        if (!fromTop) {
                            setFeedPosts(feedPosts.concat(data));
                            setOffset(finalOffset + limit)

                            if (data.length < limit) {
                                setNoMorePosts(true);
                            }

                            setRemoveTop(true);
                            setIsLoading(false);
                        } else {
                            setFeedPosts(data.concat(feedPosts));
                            setTopOffset(finalOffset - limit);

                            if (data.length < limit) {
                                setNoMoreTopPosts(true);
                                setAllowScrollToTop(false);
                            }

                            setRemoveTop(false);
                            setLoadingTop(false);
                        }
                    }).catch((error) => {
                        console.error(error);

                        if(!fromTop) {
                            setIsLoading(false);
                        } else {
                            setLoadingTop(false);
                        }
                    });
                }
            }
        } else {
            if (!fromTop) {
                setIsLoading(false);
            } else {
                setLoadingTop(false);
            }

            setFeedPosts(posts);
        }

        setRefreshFeed(false);
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
        if (window.innerHeight + document.documentElement.scrollTop >= (document.documentElement.offsetHeight/2)) {
            if (!noMorePosts && !isLoading) {
                setIsLoading(true);
                refreshFeedPosts(false, false);
            }
        }
        else if (window.innerHeight + document.documentElement.scrollTop <= (document.documentElement.offsetHeight/2) ) {
            if (!noMoreTopPosts && allowScrollToTop && !loadingTop) {
                setLoadingTop(true);
                refreshFeedPosts(false, true);
            }
        }
    }

    useEffect(() => {
        if (feedPosts.length > maxPosts && removeTop) {
            setFeedPosts(feedPosts.slice(toRemove));
            setTopOffset(maxPosts - toRemove);
            setAllowScrollToTop(true);
        }
        else if (feedPosts.length > maxPosts) {
            setFeedPosts(feedPosts.slice(0, maxPosts));
            setNoMorePosts(false);

        }
    }, [feedPosts]);



    return (
        <>
            <div className={'feed-wrapper'}>
                {loadingTop && <Spinner className={'feed-loading'}/>}
                <div className={'posts-wrapper'}>
                    {(feedPosts.length === 0 && !isLoading) &&
                        <div className={'no-posts'}>No posts to show, follow some people or make a new
                            post</div>}

                    {feedPosts.length > 0 &&
                    <div className="scroll-container" ref={ref}>
                        <ViewportList viewportRef={ref}  items={feedPosts} >
                            {(item) => (
                                <Post key={item.post_id} post={item} postViewer={currentUser} refreshFeed={refreshFeed}
                                            setRefreshFeed={setRefreshFeed} isInFavorites={isInFavorites}/>
                            )}
                        </ViewportList>
                        {noMorePosts && <h3 className={'no-more-posts'}>No more posts to show</h3>}
                    </div>}

                </div>

                {(currentUser && ((!isInProfile && feedUsername && currentUser.username === feedUsername) || (isInProfile && feedUserId && currentUser.id === feedUserId)) && !viewingOnly) && (
                    <button className={`new-post-button ${showNewPostPopup ? 'rotate' : ''}`}
                            onClick={() => setShowNewPostPopup(!showNewPostPopup)}>+</button>)}

                {isLoading && (<Spinner className={'feed-loading'}/>)}
            </div>
        </>
    )
}
