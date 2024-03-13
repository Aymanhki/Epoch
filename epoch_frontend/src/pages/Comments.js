import React, { useEffect, useState, useContext } from 'react'
import { Spinner } from '../modules/Spinner';
import {getAllComments} from '../services/comments'
import NavBar from "../modules/NavBar";import {useRef} from "react";
import PostPopup from "../modules/PostPopup";
import Post from '../modules/Post'
import {useLocation} from 'react-router-dom';
import Comment from '../modules/Comment';
import PostComments from '../styles/PostComments.css'
import {useNavigate} from 'react-router-dom';
import { UserContext } from '../services/UserContext';
import { getUserInfo } from "../services/user";


function Comments() {
  const location = useLocation();
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const [postId, setPostId] = useState(-1);
  const [comments, setComments] = useState([]);
  const [commentsPost, setCommentsPost] = useState(null);
  const [refreshFeed, setRefreshFeed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useContext(UserContext);
  const { updateUser } = useContext(UserContext);
  const [showNewPostPopup, setShowNewPostPopup] = useState(false);


  useEffect(() => {
    if (!user) {
         setIsLoading(true);
        getUserInfo()
            .then(data => {
                    setRedirectToLogin(false);
                    updateUser(data);
                    

            })
            .catch(error => {
                    setRedirectToLogin(true);
                    setIsLoading(false);
                    updateUser(null);
            });
         
    }

    
  }, [setIsLoading, setRedirectToLogin, updateUser, user]);

  useEffect(() => {
    setPostId(location.pathname.split('/comments/')[1]);
  },  [location])

  useEffect(()=>{

    if(postId != -1) {
    getAllComments(postId)
      .then(data => {
        setCommentsPost(data.post);
        setComments(data.comments);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error)
        setIsLoading(false);
      })
    }
  }, [postId])


  if(!user) {
      return <Spinner />
  }


  if(isLoading){
    return <Spinner></Spinner>
  }

  return (
    <>
    {<NavBar profilePic={user.profile_pic_data } profilePicType={user.profile_pic_type} showNewPostPopup={showNewPostPopup} setShowNewPostPopup={setShowNewPostPopup}/>}
      {isLoading ? (
        <Spinner />
      ) : (
      <div className={'post-comments-page'}>
        <div className={"post-comments-wrapper"}>
        {commentsPost && (<Post key={ commentsPost.post_id } post={commentsPost} postViewer={user} refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed} isInFavorites={false}></Post>)}
        {comments && comments.length === 0 && <div className={"no-comments"}>No comments yet</div>}
        {comments && (
          comments.map((newComment, index) => <Comment key={newComment.comm_id} commentObject={newComment}></Comment>)
        )}
        </div>
      </div>
      )}
      <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup} username={user.username} profilePic={user.profile_pic_data} refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed}/>
    </>
  )
}

export default Comments
