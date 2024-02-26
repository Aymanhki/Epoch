import React, {useEffect, useState} from 'react';
import SmartMedia from "./SmartMedia";
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import '../styles/Post.css';
import {useNavigate} from 'react-router-dom';
import {deletePost} from '../services/post';
import PostPopup from "./PostPopup";


export default function Post({post, postViewer, refreshFeed, setRefreshFeed}) {
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


    useEffect(() => {
        const currentTime = new Date();
        const postTime = new Date(post.created_at);
        const timeDifferenceInSeconds = Math.floor((currentTime - postTime) / 1000);

        if (timeDifferenceInSeconds > timeAllowedToEditInSeconds) {
            setEditable(false);
            setEditing(false);
        } else {
            setEditable(true);
            setEditing(false);
        }


        // parse the post release data to set the month, day, year, and hour
        const date = new Date(post.release);
        setReleaseMonth(parseInt(date.getMonth() + 1));
        setReleaseDay(parseInt(date.getDate()));
        setReleaseYear(parseInt(date.getFullYear()));

        let hour = date.getHours();
        let finalHour = (hour > 12) ? ((hour - 12) + ':00 PM') : (hour + ':00 AM');
        setReleaseHour(finalHour);
    }, [post.created_at, post.release]);

    useEffect(() => {
        if(!showPostPopup) {
            setUpdating(false);
            setUpdatingMessage('');
            setEditing(false);
        }
    }, [showPostPopup]);

    const handleProfilePhotoClick = (imageUrl) => {
        setOverlayImageUrl(imageUrl);
        setShowOverlay(true);
    };

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
            })
            .catch((error) => {
                setError(true);
                setErrorMessage(error);
                setTimeout(() => { setError(false); setErrorMessage(''); }, 5000);
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

    return (
            <div className={`post ${showFullCaption ? 'post-expanded' : ''}`} style={{display: ( ( (postIsInThePast() || postAdmin) && (!deleted) ) ) ? 'block' : 'none'}}>
                <div className="post-header">
                    <div className="post-header-left">
                        <div className={'profile-photo-container'}
                             onClick={() => handleProfilePhotoClick(post.profile_picture)}>
                            <SmartMedia fileUrl={post.profile_picture} file_type={post.profile_picture_type}
                                        file_name={post.profile_picture_name} alt="Profile" className="profile-photo"/>
                        </div>
                        <div className="post-header-info" >
                            <h3 className={'post-username'} onClick={() => navigate(`/${post.username}`)}>{post.username}</h3>
                            <p className={'post-date'}>{post.release}</p>
                        </div>
                    </div>

                    <div className="post-header-right">
                        {updating && (<p className="updating-message">{updatingMessage}</p>)}
                        {error && (<p className="error-message">{errorMessage}</p>)}
                        {(postAdmin && editable && !editing) && (<BorderColorOutlinedIcon className="edit-post-button-icon" onClick={() => {
                            onEditPost();
                        }}></BorderColorOutlinedIcon>)}
                        {(postAdmin && !editing) && (<DeleteForeverOutlinedIcon className="delete-post-button-icon" onClick={() => {
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

                    {showOverlay && (
                        <div className={'post-full-size-profile-photo-overlay'} onClick={closeOverlay}>
                            <img src={overlayImageUrl} alt="Full Size" className="full-size-image"/>
                        </div>
                    )}
                </div>

                <div className="post-footer">
                    <p className={"view-comments-button"}>View Comments</p>
                </div>
                {(post.file) ?
                (showPostPopup && fileBlob) && (<PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username} profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} postFile={fileBlob} year={releaseYear} month={releaseMonth} day={releaseDay} hour={releaseHour} postId={post.post_id} userId={postViewer.id}/>)
                :
                (showPostPopup) && (<PostPopup showPopup={showPostPopup} setShowPopup={setShowPostPopup} username={postViewer.username} profilePic={postViewer.profile_pic_data} refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed} editPost={true} caption={post.caption} year={releaseYear} month={releaseMonth} day={releaseDay} hour={releaseHour} postId={post.post_id} userId={postViewer.id}/>)
                }
            </div>
    );
}
