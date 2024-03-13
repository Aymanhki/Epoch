import React, { useEffect, useState } from 'react'
import {getUserInfo, getUsernameInfo} from '../services/user';
import {useNavigate} from 'react-router-dom';
import SmartMedia from "./SmartMedia";
import '../styles/Comment.css'

function Comment({commentObject}) {
  const commentCharLimit = 240;
  const navigate = useNavigate();
  //const [truncatedComment, setTruncatedComment] = useState(comment.comment.slice(0, commentCharLimit) + '...');
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState(false);
  const [overlayImageUrl, setOverlayImageUrl] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);
  


  const handleProfilePhotoClick = (imageUrl) => {
    setOverlayImageUrl(imageUrl);
    setShowOverlay(true);
  };

  
  return (
    <div className='comments'>
      <div className='comment-header'>
        <div className='comment-header-left'>
          <div className={`comment-profile-photo-container`} 
            onClick={() => handleProfilePhotoClick(commentObject.profile_picture)}>
              <SmartMedia fileUrl={commentObject.profile_picture} file_type={commentObject.profile_picture_type}
              file_name={commentObject.profile_picture_name} alt="Profile" className="comment-profile-photo"/>
          </div>
          
        </div>
        <div className='comment-header-right'>
          {/*Deleting comment */}
          <div className="comment-header-info">
            <h3 className={'comment-username'} onClick={() => navigate(`/${commentObject.username}`)}>
              {commentObject.username}
            </h3>
            <p className={'comment-date'}>{commentObject.created_at}</p>
          </div>
          <div className='comment-text'>
            {commentObject.comment}
            
          </div>
        </div>
      </div>

      <div className='comment-body'>
        
      </div>

    </div>
  );
}

export default Comment
