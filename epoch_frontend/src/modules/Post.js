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


export default function Post({post, postViewer, refreshFeed, setRefreshFeed, isInFavorites}) {
    const captionCharLimit = 240;
    const timeAllowedToEditInSeconds = 180;
    const [editable, setEditable] = useState(true);
    const [editing, setEditing] = useState(false);
    const [truncatedCaption, setTruncatedCaption] = useState(post.caption.slice(0, captionCharLimit) + '...');
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


    useEffect(() => {
        const currentTime = new Date();
        const postTime = new Date(post.created_at);
        const initialTimeDifferenceInSeconds = Math.floor((currentTime - postTime) / 1000);

        setEditable(initialTimeDifferenceInSeconds <= timeAllowedToEditInSeconds);

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
        }
    }

    const closeOverlay = () => {
        setShowOverlay(false);
        setOverlayImageUrl('');
    };

    useEffect(() => {
        if (post.caption.length > captionCharLimit) {
            setTruncatedCaption(post.caption.slice(0, captionCharLimit) + '...');
            setShowFullCaption(false);
        } else {
            setTruncatedCaption(post.caption);
            setShowFullCaption(true);
        }
    }, [post.caption]);

    const postIsInThePast = () => {
        const currentTime = new Date();
        const postTime = new Date(post.release);
        return currentTime >= postTime;
    }

    const toggleCaptionVisibility = () => {
        setShowFullCaption(!showFullCaption);
    }

    const toggleSeeLess = () => {
        setShowFullCaption(false);
    }

    const renderCaptionWithHashtags = (toRender) => {
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

    const onVotePost = (postId, userId, vote, action) => {
        // there are 6 scenarios:
        // 1. user has not voted on the post and wants to upvote
        // 2. user has not voted on the post and wants to downvote
        // 3. user has upvoted the post and wants to remove the upvote
        // 4. user has downvoted the post and wants to remove the downvote
        // 5. user has downvoted the post and wants to upvote
        // 6. user has upvoted the post and wants to downvote

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
                originalVote(1);
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
                        <p className={'post-date'}>{post.release}</p>
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
                <p className={"post-caption"}>
                    {showFullCaption ? renderCaptionWithHashtags(post.caption) : (
                        <>
                            {renderCaptionWithHashtags(truncatedCaption)}
                            <span className="see-more" onClick={toggleCaptionVisibility}>
                                    See more
                                </span>
                        </>
                    )}
                    {(showFullCaption && post.caption.length >= captionCharLimit) && (
                        <>
                            {' '}
                            <span className="see-less" onClick={toggleSeeLess}>
                                    See less
                                </span>
                        </>
                    )}
                </p>
                {(post.file && showFullCaption) && <div className={'file-wrapper'}>
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
                            <p className={'vote-count'}>{voteResult}</p>
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
                        <button className={"view-comments-button"} onClick={() => navigate(`/epoch/comments/${post.post_id}`)}>View Comments</button>
                    )}
                    
                    {postViewer && (
                        <div className={'favorite-button-wrapper'}>
                            <FavoriteBorderOutlinedIcon className={`favorite-button ${favorited ? 'active' : ''}`} onClick={() => toggleFavorite()}></FavoriteBorderOutlinedIcon>
                            <p className={'favorited-by-count'}>{favoritedByCount}</p>
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

            
            {(post.file) ?
                (showPostPopup && fileBlob && postViewer && postAdmin) && (
                    <PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username}
                               profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed}
                               setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} postFile={fileBlob}
                               year={releaseYear} month={releaseMonth} day={releaseDay} hour={releaseHour}
                               postId={post.post_id} userId={postViewer.id}/>)
                :
                (showPostPopup && postViewer && postAdmin) && (
                    <PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username}
                               profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed}
                               setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} year={releaseYear}
                               month={releaseMonth} day={releaseDay} hour={releaseHour} postId={post.post_id}
                               userId={postViewer.id}/>)
            }
        </div>
    );
}
