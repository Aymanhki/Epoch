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


export default function Post({post, postViewer, refreshFeed, setRefreshFeed, isInFavorites}) {
    const captionCharLimit = 240;
    const timeAllowedToEditInSeconds = 30;
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


    useEffect(() => {
        const now = new Date();
        const currentTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()));
        const postTime = getActualDate(post.created_at)
        const initialTimeDifferenceInSeconds = Math.floor((currentTime - postTime) / 1000);


        const timerInterval = setInterval(() => {
            const currentTime = new Date();
            const timeDifferenceInSeconds = Math.floor((currentTime - postTime) / 1000);
            setEditable(timeDifferenceInSeconds <= timeAllowedToEditInSeconds);
        }, 1000);

        return () => clearInterval(timerInterval);


        const date = new Date(post.release);
        setReleaseMonth(parseInt(date.getMonth() + 1));
        setReleaseDay(parseInt(date.getDate()));
        setReleaseYear(parseInt(date.getFullYear()));
        setReleaseMinute(parseInt(date.getMinutes()));
        setReleaseSecond(parseInt(date.getSeconds()));

        let hour = date.getHours();
        let finalHour = (hour > 12) ? ((hour - 12) + ':00 PM') : (hour + ':00 AM');
        setReleaseHour(finalHour);
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
        const postTime = getActualDate(post.release)
        const timeDifferenceInSeconds = Math.floor((now - postTime) / 1000);
        return timeDifferenceInSeconds >= 0;
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
        setError(true);
        setErrorMessage('Deleting post...');
        deletePost(postId, userId)
            .then(() => {
                setError(false);
                setErrorMessage('');
                setPostAdmin(false);
                setError(false);
                setErrorMessage('');
                setDeleted(true);
                setRefreshFeed(true);
            })
            .catch((error) => {
                setError(true);
                setErrorMessage(error);
                setTimeout(() => {
                    setError(false);
                    setErrorMessage('');
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

    const getActualDate = (dateString) => {
        // dateString = 2024-03-25T16:57:06-05:00
        // parse the date
        // parse the time
        // parse time zone
        // convert to local time
        // return the date and time object
        // first find the sign of the time zone '+' or '-'

        let timeZoneSign;
        const date = dateString.split('T')[0];
        let time = dateString.split('T')[1];

        if (time.includes('-'))
        {
            timeZoneSign = '-';
        }
        else
        {
            timeZoneSign = '+';
        }

        time = time.split(timeZoneSign)[0];
        const timeZoneHours = parseInt(dateString.split('T')[1].split(timeZoneSign)[1].split(':')[0]);
        const timeZoneMinutes = parseInt(dateString.split('T')[1].split(timeZoneSign)[1].split(':')[1]);

        let hours = parseInt(time.split(':')[0]);
        let minutes = parseInt(time.split(':')[1]);
        let seconds = parseInt(time.split(':')[2]);
        let year = parseInt(date.split('-')[0]);
        let month = parseInt(date.split('-')[1]);
        let day = parseInt(date.split('-')[2]);
        let finalHours = hours;
        let finalMinutes = minutes;

        // convert to local time
        if (timeZoneSign === '-')
        {
            finalHours = hours - timeZoneHours;
            finalMinutes = minutes - timeZoneMinutes;
        }
        else
        {
            finalHours = hours + timeZoneHours;
            finalMinutes = minutes + timeZoneMinutes;
        }

        if (finalMinutes >= 60) {
        finalHours += 1;
        finalMinutes -= 60;
        } else if (finalMinutes < 0) {
            finalHours -= 1;
            finalMinutes += 60;
        }

        if (finalHours >= 24) {
            finalHours -= 24;
            day += 1;
        } else if (finalHours < 0) {
            finalHours += 24;
            day -= 1;
        }

        const maxDaysInMonth = new Date(year, month, 0).getDate();
        if (day > maxDaysInMonth) {
            day = 1;
            month += 1;
        } else if (day < 1) {
            month -= 1;
            const previousMonthMaxDays = new Date(year, month, 0).getDate();
            day = previousMonthMaxDays;
        }

        if (month > 12) {
            month = 1;
            year += 1;
        }
        else if (month < 1) {
            month = 12;
            year -= 1;
        }

        let toReturn = Date(year, month - 1, day, finalHours, finalMinutes, seconds);

        // If time zone is different from local time zone, then apply local time zone as well
        // get local time zone first
        // const now = new Date();
        // const localTimeZoneOffset = now.getTimezoneOffset();

        return toReturn;
    }

    const formatDate = (date) => {
        return date.toString();
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
                        <p className={'post-date'}>{formatDate(getActualDate(post.release))}</p>
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
                            onDeletePost(post.post_id, postViewer.id);
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
                            <ArrowCircleUpSharpIcon className={`up-vote-button ${upVoted ? 'active' : ''}`} onClick={() => {
                                if(vote === 1)
                                {
                                    onVotePost(post.post_id, postViewer.id, vote, 'removeUpVote');
                                }
                                else
                                {
                                    onVotePost(post.post_id, postViewer.id, vote, 'upVote');
                                }
                            }}></ArrowCircleUpSharpIcon>
                            <button className={'vote-count'} onClick={() => {
                                if (voteByUsernameList.length > 0) {
                                    setShowFavoritedByList(false);
                                    setShowVoteByList(true);
                                }
                            }}>{voteResult}</button>
                            <ArrowCircleDownSharpIcon className={`down-vote-button ${downVoted ? 'active' : ''}`} onClick={() => {
                                if(vote === -1)
                                {
                                    onVotePost(post.post_id, postViewer.id, vote, 'removeDownVote');
                                }
                                else
                                {
                                    onVotePost(post.post_id, postViewer.id, vote, 'downVote');
                                }
                            }}></ArrowCircleDownSharpIcon>
                        </div>
                    )}

                    {((!showCommentsSection) && postViewer) && (
                        <button className={"view-comments-button"} onClick={() => navigate(`/epoch/comments/${post.post_id}`)}><ForumOutlinedIcon/></button>
                    )}
                    
                    {postViewer && (
                        <div className={'favorite-button-wrapper'}>
                            <FavoriteBorderOutlinedIcon className={`favorite-button ${favorited ? 'active' : ''}`} onClick={() => toggleFavorite()}></FavoriteBorderOutlinedIcon>
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
                (showPostPopup && fileBlob && postViewer && postAdmin) && (<PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username} profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} postFile={fileBlob} year={releaseYear} month={releaseMonth} day={releaseDay} hour={releaseHour} postId={post.post_id} userId={postViewer.id}/>)
                :
                (showPostPopup && postViewer && postAdmin) && (<PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username} profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} year={releaseYear} month={releaseMonth} day={releaseDay} hour={releaseHour} postId={post.post_id} userId={postViewer.id}/>)
                }
                {showOverlay && (
                    <div className={'post-full-size-profile-photo-overlay'} onClick={closeOverlay}>
                        <img src={overlayImageUrl} alt="Full Size" className="full-size-image"/>
                    </div>
                )}
            </div>

            <PopupUserList showUserListModal={showFavoritedByList} setShowUserListModal={setShowFavoritedByList} popupList={favoritedByUsernameList}/>
             <PopupUserList showUserListModal={showVoteByList} setShowUserListModal={setShowVoteByList} popupList={voteByUsernameList}/>

            
            {(post.file) ?
                (showPostPopup && fileBlob && postViewer && postAdmin) && (
                    <PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username}
                               profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed}
                               setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} postFile={fileBlob}
                               year={releaseYear} month={releaseMonth}  day={releaseDay} hour={releaseHour}  minute={releaseMinute} second={releaseSecond}
                               postId={post.post_id} userId={postViewer.id}/>)
                :
                (showPostPopup && postViewer && postAdmin) && (
                    <PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username}
                               profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed}
                               setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} year={releaseYear}
                               month={releaseMonth} day={releaseDay} hour={releaseHour} minute={releaseMinute} second={releaseSecond} postId={post.post_id}
                               userId={postViewer.id}/>)
            }
        </div>
    );
}
