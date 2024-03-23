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

  const handleProfilePhotoClick = (imageUrl) => {
    setOverlayImageUrl(imageUrl);
    setShowOverlay(true);
  };

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
            <DeleteForeverOutlinedIcon className="delete-comment-icon" onClick={() => onDeleteComment(commentObject.comm_id)}/>
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
      </div>
  );
}

export default Comment;
