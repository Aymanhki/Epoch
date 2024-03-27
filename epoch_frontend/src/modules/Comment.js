import React, { useEffect, useState } from 'react'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import {getUserInfo, getUsernameInfo} from '../services/user';
import {useNavigate} from 'react-router-dom';
import SmartMedia from "./SmartMedia";
import '../styles/Comment.css'
import {deleteComment} from '../services/comments'
import {animated, useSpring} from "react-spring";

function Comment({commentObject, commentViewer, refreshComments, setRefreshComments}) {
  const commentCharLimit = 240;
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState(false);
  const [overlayImageUrl, setOverlayImageUrl] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteCommentPopup, setShowDeleteCommentPopup] = useState(false);
  const [deleteCommentError, setDeleteCommentError] = useState(false);
  const [deleteCommentErrorPrompt, setDeleteCommentErrorPrompt] = useState('');

  const {transform: inTransformDeleteComment} = useSpring({
        transform: `translateY(${showDeleteCommentPopup ? 0 : 100}vh)`,
        config: {duration: 300},
    });

    const {transform: outTransformDeleteComment} = useSpring({
        transform: `translateY(${showDeleteCommentPopup ? 0 : -100}vh)`,
        config: {duration: 300},
    });

  const handleProfilePhotoClick = (imageUrl) => {
    setOverlayImageUrl(imageUrl);
    setShowOverlay(true);
  };

    const onDeleteComment = (comm_id) => {
        if (deleting) {return;}

        setDeleting(true);
        setDeleteCommentErrorPrompt('Deleting comment...')
        setDeleteCommentError(true);
      deleteComment(comm_id, commentObject.post_id, commentViewer.id)
        .then(() => {
          setDeleted(true);
          setDeleting(false);
          setShowDeleteCommentPopup(false);
          setDeleteCommentError(false);
          setDeleteCommentErrorPrompt('');
          setRefreshComments(true);
        })
        .catch((error) => {
          setDeleting(false);
          setDeleteCommentErrorPrompt(error);
          setDeleteCommentError(true);
          setShowDeleteCommentPopup(true);

            setTimeout(() => {
                setDeleteCommentError(false);
                setDeleteCommentErrorPrompt('');
            }, 5000);
        });
    }

    const getActualCreatedDate = () => {
        let date = new Date(commentObject.created_at);
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

    const closeOverlay = () => {
        setShowOverlay(false);
        setOverlayImageUrl('');
    };

  
  return (
      <div className='comments' style={{display: deleted ? 'none' : 'block'}}>

          <div className='comment-header'>

              <div></div>

              <div className="comment-header-left">
                  <div className="comment-header-info">
                      <h3 className={'comment-username'} onClick={() => navigate(`/${commentObject.username}`)}>
                          {commentObject.username}
                      </h3>
                      <p className={'comment-date'}>{getActualCreatedDate()}</p>
                  </div>
              </div>

              <div className="comment-header-right">
                  {error && (<p className="comment-error-message">{errorMessage}</p>)}

                  {commentViewer.username === commentObject.username && (
                      <DeleteForeverOutlinedIcon className="delete-comment-icon"
                                                 onClick={() => setShowDeleteCommentPopup(true)}/>)}

              </div>

          </div>


          <div className='comment-body'>

              <div className={`comment-profile-photo-container`}
                   onClick={() => handleProfilePhotoClick(commentObject.profile_picture)}>
                  <SmartMedia fileUrl={commentObject.profile_picture} file_type={commentObject.profile_picture_type}
                              file_name={commentObject.profile_picture_name} alt="Profile"
                              className="comment-profile-photo"/>
              </div>


              <div className='comment-text'>
                  {commentObject.comment}
              </div>

          </div>

          {showOverlay && (
              <div className={'comment-full-size-profile-photo-overlay'} onClick={closeOverlay}>
                  <img src={overlayImageUrl} alt="Full Size" className="full-size-image"/>
              </div>
          )}

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
                  transform: showDeleteCommentPopup ? inTransformDeleteComment : outTransformDeleteComment,
                  zIndex: 1000
              }}
          >
              <div className="delete-comment-overlay" onClick={() => setShowDeleteCommentPopup(false)}></div>

              <div className="delete-comment-modal">
                  <h3 className="delete-comment-header">Are you sure you want to delete this comment?</h3>
                  {deleteCommentError && <p className="delete-comment-error">{deleteCommentErrorPrompt}</p>}

                  <div className={'delete-comment-buttons-wrapper'}>
                      <button className="delete-comment-button-no"
                              onClick={() => setShowDeleteCommentPopup(false)}>No
                      </button>
                      <button className="delete-comment-button-yes" data-testid="delete-comment-button-yes"
                              id="delete-comment-button-yes"
                              onClick={() => {
                                  onDeleteComment(commentObject.comm_id);
                              }}>Yes
                      </button>
                  </div>
              </div>
          </animated.div>
      </div>

  );
}

export default Comment;
