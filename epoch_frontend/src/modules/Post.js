import React, {useEffect, useState} from 'react';
import SmartMedia from "./SmartMedia";
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import '../styles/Post.css';
import {useNavigate} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {deletePost} from '../services/post';
import PostPopup from "./PostPopup";
import ArrowCircleUpSharpIcon from '@mui/icons-material/ArrowCircleUpSharp';
import ArrowCircleDownSharpIcon from '@mui/icons-material/ArrowCircleDownSharp';
import {favoritePost, removeFavoritePost, votePost, removeVotePost} from "../services/post";
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import PopupUserList from "./PopupUserList";
import {animated, useSpring} from "react-spring";


export default function Post({post, postViewer, refreshFeed, setRefreshFeed, isInFavorites}) {
    const captionCharLimit = 240;
    const timeAllowedToEditInSeconds = 30000;
    const [editable, setEditable] = useState(false);
    const [editing, setEditing] = useState(false);
    const [truncatedCaption, setTruncatedCaption] = useState((post && post.caption) ? post.caption.slice(0, captionCharLimit) + '...' : '');
    const [showFullCaption, setShowFullCaption] = useState(false);
    const navigate = useNavigate();
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayImageUrl, setOverlayImageUrl] = useState('');
    const [postAdmin, setPostAdmin] = useState(postViewer && postViewer.username === post.username);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleted, setDeleted] = useState(false);
    const [showPostPopup, setShowPostPopup] = useState(false);
    const [releaseMonth, setReleaseMonth] = useState('');
    const [releaseDay, setReleaseDay] = useState(-1);
    const [releaseYear, setReleaseYear] = useState(-1);
    const [releaseHour, setReleaseHour] = useState('');
    const [releaseMinute, setReleaseMinute] = useState(-1);
    const [releaseSecond, setReleaseSecond] = useState(-1);
    const [fileBlob, setFileBlob] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [updatingMessage, setUpdatingMessage] = useState('');
    const [favorited, setFavorited] = useState(false);
    const [favoritedByCount, setFavoritedByCount] = useState(0);
    const location = useLocation(); // Get current location
    const [showCommentsSection, setShowCommentsSection] = useState(false);
    const [vote, setVote] = useState(0);
    const [upVoted, setUpVoted] = useState(false);
    const [downVoted, setDownVoted] = useState(false);
    const [voteResult, setVoteResult] = useState(0);
    const [originalVote, setOriginalVote] = useState(0);
    const [favoritedByUsernameList, setFavoritedByUsernameList] = useState((post && post.favorited_by_usernames) ? post.favorited_by_usernames : []);
    const [voteByUsernameList, setVoteByUsernameList] = useState((post && post.votes_by_usernames) ? post.votes_by_usernames : []);
    const [showFavoritedByList, setShowFavoritedByList] = useState(false);
    const [showVoteByList, setShowVoteByList] = useState(false);
    const [showDeletePostPopup, setShowDeletePostPopup] = useState(false);
    const [deletePostError, setDeletePostError] = useState(false);
    const [deletePostErrorPrompt, setDeletePostErrorPrompt] = useState('');

    const {transform: inTransformDeletePost} = useSpring({
        transform: `translateY(${showDeletePostPopup ? 0 : 100}vh)`,
        config: {duration: 300},
    });

    const {transform: outTransformDeletePost} = useSpring({
        transform: `translateY(${showDeletePostPopup ? 0 : -100}vh)`,
        config: {duration: 300},
    });

    useEffect(() => {
        let postTime = new Date(post.created_at)
        postTime = new Date(Date.UTC(postTime.getFullYear(), postTime.getMonth(), postTime.getDate(), postTime.getHours(), postTime.getMinutes(), postTime.getSeconds()));

        const timerInterval = setInterval(() => {
            const currentTime = new Date();
            const timeDifferenceInSeconds = Math.floor((currentTime - postTime) / 1000);
            setEditable(timeDifferenceInSeconds <= timeAllowedToEditInSeconds);
        }, 1000);

        let date = new Date(post.release);
        date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
        setReleaseMonth(parseInt(date.getMonth() + 1));
        setReleaseDay(parseInt(date.getDate()));
        setReleaseYear(parseInt(date.getFullYear()));
        setReleaseMinute(parseInt(date.getMinutes()));
        setReleaseSecond(parseInt(date.getSeconds()));

        let hour = date.getHours();
        let finalHour = (hour > 12) ? ((hour - 12) + ':00 PM') : (hour + ':00 AM');
        setReleaseHour(finalHour);

        return () => clearInterval(timerInterval);


    }, [post.created_at, post.release, timeAllowedToEditInSeconds]);

    useEffect(() => {
        if (!showPostPopup) {
            setUpdating(false);
            setUpdatingMessage('');
            setEditing(false);
        }
    }, [showPostPopup]);
    const handleProfilePhotoClick = (imageUrl) => {
        setOverlayImageUrl(imageUrl);
        setShowOverlay(true);
    };

    const handlePostMediaClick = () => {
        setOverlayImageUrl(post.file);
        setShowOverlay(true);
    }

    const toggleFavorite = () => {
        if (postViewer) {
            if (favorited) {
                setFavorited(false);
                setFavoritedByCount(favoritedByCount - 1);
                removeFavoritePost(post.post_id, postViewer.id)
                    .then(() => {
                    })
                    .catch((error) => {
                        setError(true);
                        setErrorMessage(error);
                        setFavorited(true);
                        setFavoritedByCount(favoritedByCount);
                        setTimeout(() => {
                            setError(false);
                            setErrorMessage('');
                        }, 5000);
                    });
            } else {
                setFavorited(true);
                setFavoritedByCount(favoritedByCount + 1);
                favoritePost(post.post_id, postViewer.id)
                    .then(() => {
                    })
                    .catch((error) => {
                        setError(true);
                        setFavorited(false);
                        setFavoritedByCount(favoritedByCount);
                        setErrorMessage(error);
                        setTimeout(() => {
                            setError(false);
                            setErrorMessage('');
                        }, 5000);
                    });
            }

            setShowFavoritedByList(false);
        }
    }

    const closeOverlay = () => {
        setShowOverlay(false);
        setOverlayImageUrl('');
    };

    useEffect(() => {
        if (post.caption && post.caption.length > captionCharLimit) {
            setTruncatedCaption(post.caption.slice(0, captionCharLimit) + '...');
            setShowFullCaption(false);
        } else {
            setTruncatedCaption(post.caption);
            setShowFullCaption(true);
        }
    }, [post.caption]);

    const postIsInThePast = () => {
        const now = new Date();
        let postTime = new Date(post.release);
        postTime = new Date(Date.UTC(postTime.getFullYear(), postTime.getMonth(), postTime.getDate(), postTime.getHours(), postTime.getMinutes(), postTime.getSeconds()));
        return now >= postTime;
    }

    const toggleCaptionVisibility = () => {
        setShowFullCaption(!showFullCaption);
    }

    const toggleSeeLess = () => {
        setShowFullCaption(false);
    }

    const renderCaptionWithHashtags = (toRender) => {

        if(!toRender) {return;}
        const words = toRender.split(' ');
        return words.map((word, index) => {
            if (word.startsWith('#') && word.length > 1) {
                const hashtag = word.slice(1);

                return (
                    <>
                      <span key={index} className="hashtag" onClick={() => navigate(`/hashtags/#${hashtag}`)}>
                        {word}
                      </span>
                        {' '}
                    </>
                );
            } else {
                return word + ' ';
            }
        });
    }

    const onDeletePost = (postId, userId) => {

        setDeletePostError(true);
        setDeletePostErrorPrompt('Deleting post...');

        deletePost(postId, userId)
            .then(() => {
                setDeletePostError(false);
                setDeletePostErrorPrompt('');
                setShowDeletePostPopup(false);
                setPostAdmin(false);
                setDeleted(true);
                setRefreshFeed(true);
            })
            .catch((error) => {
                setShowDeletePostPopup(true);
                setDeletePostError(true);
                setDeletePostErrorPrompt(error);

                setTimeout(() => {
                    setDeletePostError(false);
                    setDeletePostErrorPrompt('');
                }, 5000);
            });
    }

    const onEditPost = async () => {
        setUpdating(true);
        setEditing(true);
        setUpdatingMessage('Loading post editor...');
        if (post.file) {
            const file = await fetch(post.file)
            const blob = await file.blob();
            await setFileBlob(blob);
        }

        setShowPostPopup(true);
    }

    const getReleaseFormat = () => {
        let date = new Date(post.release);
        date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
        const now = new Date();
        const diff = now - date;
        const diffInSeconds = Math.floor(diff / 1000);
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        };

        if (date > now) {
            const diff = date - now;
            const diffInSeconds = Math.floor(diff / 1000);
            if (diffInSeconds < 60) {
                return "In " + Math.floor(diffInSeconds) + (Math.floor(diffInSeconds) > 1 ? " seconds" : " second");
            }

            if (diffInSeconds < 3600) {
                return "In " + Math.floor(diffInSeconds / 60) + (Math.floor(diffInSeconds / 60) > 1 ? " minutes" : " minute");
            }

            if (diffInSeconds < 86400) {
                return "In " + Math.floor(diffInSeconds / 3600) + (Math.floor(diffInSeconds / 3600) > 1 ? " hours" : " hour");
            }

            return "Scheduled for " + new Intl.DateTimeFormat('en-US', options).format(date);
        }

        if (diffInSeconds < 60) {
            return "Just now";
        }

        if (diffInSeconds < 3600) {
            return Math.floor(diffInSeconds / 60) + (Math.floor(diffInSeconds / 60) > 1 ? " minutes ago" : " minute ago");
        }

        if (diffInSeconds < 86400) {
            return Math.floor(diffInSeconds / 3600) + (Math.floor(diffInSeconds / 3600) > 1 ? " hours ago" : " hour ago");
        }

        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    const onVotePost = (postId, userId, vote, action) => {
        // there are 6 scenarios:
        // 1. user has not voted on the post and wants to upvote
        // 2. user has not voted on the post and wants to downvote
        // 3. user has upvoted the post and wants to remove the upvote
        // 4. user has downvoted the post and wants to remove the downvote
        // 5. user has downvoted the post and wants to upvote
        // 6. user has upvoted the post and wants to downvote

        setShowVoteByList(false)
        if (vote === 0 && action === 'upVote') {
            setVote(1);
            setUpVoted(true);
            setDownVoted(false);
            setVoteResult(voteResult + 1);
            votePost(postId, userId, 1)
                .then((data) => {
                })
                .catch((error) => {
                    setError(true);
                    setErrorMessage(error);
                    setVote(0);
                    setUpVoted(false);
                    setDownVoted(false);
                    setVoteResult(voteResult);
                    setTimeout(() => {
                        setError(false);
                        setErrorMessage('');
                    }, 5000);
                });
        }

        if (vote === 0 && action === 'downVote') {
            setVote(-1);
            setUpVoted(false);
            setDownVoted(true);
            setVoteResult(voteResult - 1);
            votePost(postId, userId, -1)
                .then((data) => {
                })
                .catch((error) => {
                    setError(true);
                    setErrorMessage(error);
                    setVote(0);
                    setUpVoted(false);
                    setDownVoted(false);
                    setVoteResult(voteResult);

                    setTimeout(() => {
                        setError(false);
                        setErrorMessage('');
                    }, 5000);
                });
        }

        if (vote === 1 && action === 'removeUpVote') {
            setVote(0);
            setUpVoted(false);
            setDownVoted(false);
            setVoteResult(voteResult - 1);
            removeVotePost(postId, userId, -1)
                .then((data) => {
                })
                .catch((error) => {
                    setError(true);
                    setErrorMessage(error);
                    setVote(1);
                    setUpVoted(true);
                    setDownVoted(false);
                    setVoteResult(voteResult);

                    setTimeout(() => {
                        setError(false);
                        setErrorMessage('');
                    }, 5000);
                });
        }

        if (vote === -1 && action === 'removeDownVote') {
            setVote(0);
            setUpVoted(false);
            setDownVoted(false);
            setVoteResult(voteResult + 1);
            removeVotePost(postId, userId, 1)
                .then((data) => {
                })
                .catch((error) => {
                    setError(true);
                    setErrorMessage(error);
                    setVote(-1);
                    setUpVoted(false);
                    setDownVoted(true);
                    setVoteResult(voteResult);

                    setTimeout(() => {
                        setError(false);
                        setErrorMessage('');
                    }, 5000);
                });
        }


        if (vote === -1 && action === 'upVote') {
            setVote(1);
            setUpVoted(true);
            setDownVoted(false);
            setVoteResult(voteResult + 2);

            removeVotePost(postId, userId, -1)
                .then((data) => {
                })
                .catch((error) => {
                    setError(true);
                    setErrorMessage(error);
                    setVote(-1);
                    setUpVoted(false);
                    setDownVoted(true);
                    setVoteResult(voteResult);
                    setTimeout(() => {
                        setError(false);
                        setErrorMessage('');
                    }, 5000);
                });


            votePost(postId, userId, 1)
                .then((data) => {
                })
                .catch((error) => {
                    setError(true);
                    setErrorMessage(error);
                    setVote(-1);
                    setUpVoted(false);
                    setDownVoted(true);
                    setVoteResult(voteResult);

                    setTimeout(() => {
                        setError(false);
                        setErrorMessage('');
                    }, 5000);
                });
        }

        if (vote === 1 && action === 'downVote') {
            setVote(-1);
            setUpVoted(false);
            setDownVoted(true);
            setVoteResult(voteResult - 2);


            removeVotePost(postId, userId, 1)
                .then((data) => {
                })
                .catch((error) => {
                    setError(true);
                    setErrorMessage(error);
                    setVote(1);
                    setUpVoted(true);
                    setDownVoted(false);
                    setVoteResult(voteResult);

                    setTimeout(() => {
                        setError(false);
                        setErrorMessage('');
                    }, 5000);
                });


            votePost(postId, userId, -1)
                .then((data) => {
                })
                .catch((error) => {
                    setError(true);
                    setErrorMessage(error);
                    setVote(1);
                    setUpVoted(true);
                    setDownVoted(false);
                    setVoteResult(voteResult);

                    setTimeout(() => {
                        setError(false);
                        setErrorMessage('');
                    }, 5000);
                });
        }
    }

    useEffect(() => {

        if (postViewer && post.favorited_by.includes(postViewer.id)) {
            setFavorited(true);
        } else {
            setFavorited(false);
        }

        setFavoritedByCount(parseInt(post.favorited_by_count));

    }, [post.favorited_by, postViewer]);

    useEffect(() => {
        setShowCommentsSection(location.pathname.includes('/comments'));
    }, [location]);

    useEffect(() => {

        let voteResult = 0;

        if (postViewer && post.votes)
        {
            if (post.votes[postViewer.id] === 1)
            {
                setVote(1);
                setOriginalVote(1)
                setUpVoted(true);
                setDownVoted(false);
            }
            else if (post.votes[postViewer.id] === -1)
            {
                setVote(-1);
                setOriginalVote(-1);
                setUpVoted(false);
                setDownVoted(true);
            }
            else
            {
                setVote(0);
                setOriginalVote(0);
                setUpVoted(false);
                setDownVoted(false);
            }

            for (let key in post.votes)
            {
                voteResult += post.votes[key];
            }
        }

        setVoteResult(voteResult);

    }, [post.votes, postViewer]);

    useEffect(() => {
        if (favorited)
        {
            let updatedFavoritedByUsernameList = favoritedByUsernameList.filter((user) => user.user_id !== postViewer.id);
            updatedFavoritedByUsernameList.push({username:postViewer.username, user_id:postViewer.id});
            setFavoritedByUsernameList(updatedFavoritedByUsernameList);
        }
        else
        {
            let updatedFavoritedByUsernameList = favoritedByUsernameList.filter((user) => user.user_id !== postViewer.id);
            setFavoritedByUsernameList(updatedFavoritedByUsernameList);
        }
    }, [favorited, favoritedByUsernameList, postViewer, post, favoritedByCount]);

    useEffect(() => {
        if (vote == 0)
        {
            let updatedVoteByUsernameList = voteByUsernameList.filter((user) => user.user_id !== postViewer.id);
            setVoteByUsernameList(updatedVoteByUsernameList);
        }
        else if(vote == 1)
        {
            let updatedVoteByUsernameList = voteByUsernameList.filter((user) => user.user_id !== postViewer.id);
            updatedVoteByUsernameList.push({user_id:postViewer.id, username:postViewer.username, vote:1});
            setVoteByUsernameList(updatedVoteByUsernameList);
        }
        else
        {
            let updatedVoteByUsernameList = voteByUsernameList.filter((user) => user.user_id !== postViewer.id);
            updatedVoteByUsernameList.push({user_id:postViewer.id, username:postViewer.username, vote:-1});
            setVoteByUsernameList(updatedVoteByUsernameList);
        }
    }, [vote, voteByUsernameList, postViewer, post, voteResult]);


    return (
        <div className={`post ${showFullCaption ? 'post-expanded' : ''}`}
             style={{display: (((postIsInThePast() || postAdmin) && (!deleted) && ((isInFavorites && favorited) || !isInFavorites))) ? 'block' : 'none'}}>
            <div className="post-header">
                <div className="post-header-left">
                    <div className={'profile-photo-container'}
                         onClick={() => handleProfilePhotoClick(post.profile_picture)}>
                        <SmartMedia fileUrl={post.profile_picture} file_type={post.profile_picture_type}
                                    file_name={post.profile_picture_name} alt="Profile" className="profile-photo"/>
                    </div>
                    <div className="post-header-info">
                        <h3 className={'post-username'}
                            onClick={() => navigate(`/${post.username}`)}>{post.username}</h3>
                        <p className={'post-date'}>{getReleaseFormat()}</p>
                    </div>
                </div>

                <div className="post-header-right">
                    {updating && (<p className="updating-message">{updatingMessage}</p>)}
                    {error && (<p className="error-message">{errorMessage}</p>)}
                    {(postViewer && postAdmin && editable && !editing) && (
                        <BorderColorOutlinedIcon className="edit-post-button-icon" onClick={() => {
                            onEditPost();
                        }}></BorderColorOutlinedIcon>)}
                    {(postViewer && postAdmin && !editing) && (
                        <DeleteForeverOutlinedIcon className="delete-post-button-icon" onClick={() => {
                            setShowDeletePostPopup(true);
                        }}></DeleteForeverOutlinedIcon>)}

                </div>
            </div>

            <div className="post-body">
                {post.caption && post.caption.length > 0 && (
                    <p className={"post-caption"}>
                        {(showFullCaption && post.caption) ? renderCaptionWithHashtags(post.caption) : (
                            <>
                                {renderCaptionWithHashtags(truncatedCaption)}
                                <span className="see-more" onClick={toggleCaptionVisibility}>
                                    See more
                                </span>
                            </>
                        )}
                        {(showFullCaption && post.caption && post.caption.length >= captionCharLimit) && (
                            <>
                                {' '}
                                <span className="see-less" onClick={toggleSeeLess}>
                                    See less
                                </span>
                            </>
                        )}
                    </p>
                )}
                {(post.file && showFullCaption) && <div className={'file-wrapper'} onClick={handlePostMediaClick}>
                    <div className={'post-file'}><SmartMedia file={post.file} fileUrl={post.file}
                                                             file_type={post.file_type}
                                                             file_name={post.file_name} className={"post-media"}/></div>
                </div>}

                <div className="post-footer">
                    {postViewer && (
                        <div className={'vote-buttons'}>
                            <ArrowCircleUpSharpIcon className={`up-vote-button ${upVoted ? 'active' : ''}`}
                                                    onClick={() => {
                                                        if (vote === 1) {
                                                            onVotePost(post.post_id, postViewer.id, vote, 'removeUpVote');
                                                        } else {
                                                            onVotePost(post.post_id, postViewer.id, vote, 'upVote');
                                                        }
                                                    }}></ArrowCircleUpSharpIcon>
                            <button className={'vote-count'} onClick={() => {
                                if (voteByUsernameList.length > 0) {
                                    setShowFavoritedByList(false);
                                    setShowVoteByList(true);
                                }
                            }}>{voteResult}</button>
                            <ArrowCircleDownSharpIcon className={`down-vote-button ${downVoted ? 'active' : ''}`}
                                                      onClick={() => {
                                                          if (vote === -1) {
                                                              onVotePost(post.post_id, postViewer.id, vote, 'removeDownVote');
                                                          } else {
                                                              onVotePost(post.post_id, postViewer.id, vote, 'downVote');
                                                          }
                                                      }}></ArrowCircleDownSharpIcon>
                        </div>
                    )}

                    {((!showCommentsSection) && postViewer) && (
                        <button className={"view-comments-button"}
                                onClick={() => navigate(`/epoch/comments/${post.post_id}`)}><ForumOutlinedIcon/>
                        </button>
                    )}

                    {postViewer && (
                        <div className={'favorite-button-wrapper'}>
                            <FavoriteBorderOutlinedIcon className={`favorite-button ${favorited ? 'active' : ''}`}
                                                        onClick={() => toggleFavorite()}></FavoriteBorderOutlinedIcon>
                            <button className={'favorited-by-count'} onClick={() => {
                                if (favoritedByCount > 0) {
                                    setShowVoteByList(false);
                                    setShowFavoritedByList(true);
                                }
                            }}>
                                {favoritedByCount}</button>
                        </div>)}


                </div>
                {(post.file) ?
                    (showPostPopup && fileBlob && postViewer && postAdmin) && (
                        <PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username}
                                   profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed}
                                   setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption}
                                   postFile={fileBlob} year={releaseYear} month={releaseMonth} day={releaseDay}
                                   hour={releaseHour} postId={post.post_id} userId={postViewer.id}/>)
                    :
                    (showPostPopup && postViewer && postAdmin) && (
                        <PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username}
                                   profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed}
                                   setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} year={releaseYear}
                                   month={releaseMonth} day={releaseDay} hour={releaseHour} postId={post.post_id}
                                   userId={postViewer.id}/>)
                }
                {showOverlay && (
                    <div className={'post-full-size-profile-photo-overlay'} onClick={closeOverlay}>
                        <img src={overlayImageUrl} alt="Full Size" className="full-size-image"/>
                    </div>
                )}
            </div>

            <PopupUserList showUserListModal={showFavoritedByList} setShowUserListModal={setShowFavoritedByList}
                           popupList={favoritedByUsernameList}/>
            <PopupUserList showUserListModal={showVoteByList} setShowUserListModal={setShowVoteByList}
                           popupList={voteByUsernameList}/>


            {(post.file) ?
                (showPostPopup && fileBlob && postViewer && postAdmin) && (
                    <PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username}
                               profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed}
                               setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} postFile={fileBlob}
                               year={releaseYear} month={releaseMonth} day={releaseDay} hour={releaseHour}
                               minute={releaseMinute} second={releaseSecond}
                               postId={post.post_id} userId={postViewer.id}/>)
                :
                (showPostPopup && postViewer && postAdmin) && (
                    <PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username}
                               profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed}
                               setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} year={releaseYear}
                               month={releaseMonth} day={releaseDay} hour={releaseHour} minute={releaseMinute}
                               second={releaseSecond} postId={post.post_id}
                               userId={postViewer.id}/>)
            }

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
                    transform: showDeletePostPopup ? inTransformDeletePost : outTransformDeletePost,
                    zIndex: 1000
                }}
            >
                <div className="delete-post-overlay" onClick={() => setShowDeletePostPopup(false)}></div>

                <div className="delete-post-modal">
                    <h3 className="delete-post-header">Are you sure you want to delete this post?</h3>
                    {deletePostError && <p className="delete-post-error">{deletePostErrorPrompt}</p>}

                    <div className={'delete-post-buttons-wrapper'}>
                        <button className="delete-post-button-no"
                                onClick={() => setShowDeletePostPopup(false)}>No
                        </button>
                        <button className="delete-post-button-yes" data-testid="delete-post-button-yes"
                                id="delete-post-button-yes"
                                onClick={() => {onDeletePost(post.post_id, postViewer.id);}}>Yes
                        </button>
                    </div>
                </div>
            </animated.div>
        </div>
    );
}
