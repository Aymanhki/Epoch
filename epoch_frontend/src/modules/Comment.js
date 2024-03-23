import React, { useEffect, useState } from 'react'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import {getUserInfo, getUsernameInfo} from '../services/user';
import {useNavigate} from 'react-router-dom';
import SmartMedia from "./SmartMedia";
import '../styles/Comment.css'
import {deleteComment} from '../services/comments'

function Comment({commentObject, commentViewer, refreshComments, setRefreshComments}) {
  const commentCharLimit = 240;
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState(false);
  const [overlayImageUrl, setOverlayImageUrl] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handleProfilePhotoClick = (imageUrl) => {
    setOverlayImageUrl(imageUrl);
    setShowOverlay(true);
  };

  const donothing = () => {

  }

    const onDeleteComment = (comm_id) => {
        if (deleting) {return;}

        setDeleting(true);
        setErrorMessage('Deleting comment...');
        setError(true);

      deleteComment(comm_id, commentObject.post_id, commentViewer.id)
        .then(() => {
          setDeleted(true);
          setDeleting(false);
          setRefreshComments(true);
        })
        .catch((error) => {
          setError(true);
          setErrorMessage(error);
            setDeleting(false);

            setTimeout(() => {
                setError(false);
                setErrorMessage('');
            }, 5000);
        });
    }

  
  return (
    <div className='comments' style={{display: deleted ? 'none' : 'block'}}>

      <div className='comment-header'>

        <div></div>

        <div className="comment-header-left">
          <div className="comment-header-info">
            <h3 className={'comment-username'} onClick={() => navigate(`/${commentObject.username}`)}>
              {commentObject.username}
            </h3>
            <p className={'comment-date'}>{commentObject.created_at}</p>
          </div>
        </div>

        <div className="comment-header-right">
          {error && (<p className="comment-error-message">{errorMessage}</p>)}

          {commentViewer.username === commentObject.username && (
            <DeleteForeverOutlinedIcon className="delete-comment-icon" onClick={() => setShowDeletePopup(!showDeletePopup)}/>
          )}
        </div>

      </div>


      <div className='comment-body'>

        <div className={`comment-profile-photo-container`}
             onClick={() => handleProfilePhotoClick(commentObject.profile_picture)}>
          <SmartMedia fileUrl={commentObject.profile_picture} file_type={commentObject.profile_picture_type}
                      file_name={commentObject.profile_picture_name} alt="Profile" className="comment-profile-photo"/>
        </div>


        <div className='comment-text'>
          {commentObject.comment}
        </div>

      </div>
      {showDeletePopup ? (
        <>
        <div className='delete-comment-header-wrapper'>
          <h3 className="delete-comment-header">Are you sure you want to delete this comment?</h3>
        </div>

          <div className={'delete-comment-buttons-wrapper'}>
            <button className="delete-comment-button-no" onClick={() => setShowDeletePopup(false)}>No</button>
            <button className="delete-comment-button-yes" onClick={() => onDeleteComment(commentObject.comm_id)}>Yes</button>
          </div>
        </>
          ):(donothing)}
      </div>
  );
}

export default Comment;
