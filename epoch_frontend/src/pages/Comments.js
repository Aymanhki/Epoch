import React, { useEffect, useState, useContext } from 'react'
import { Spinner } from '../modules/Spinner';
import {getAllComments} from '../services/comments'
import NavBar from "../modules/NavBar";
import PostPopup from "../modules/PostPopup";
import Post from '../modules/Post'
import {useLocation} from 'react-router-dom';
import Comment from '../modules/Comment';
import '../styles/PostComments.css'
import { UserContext } from '../services/UserContext';
import { getUserInfo } from "../services/user";
import CommentPopup from "../modules/CommentPopup";
import {useNavigate} from "react-router-dom";



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
  const [showNewCommentPopup, setShowNewCommentPopup] = useState(false);
  const [refreshComments, setRefreshComments] = useState(false);
  const navigate = useNavigate();

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
    if (refreshComments) {
        setIsLoading(true);
          getAllComments(postId)
            .then(data => {
              setCommentsPost(data.post);
              setComments(data.comments);
              setRefreshComments(false);
              setIsLoading(false);
            })
            .catch(error => {
              console.log(error)
              setRefreshComments(false);
                setIsLoading(false);
                setRedirectToLogin(true);
                navigate('/epoch/login')
            })
        }
    }, [refreshComments]);

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
        setRedirectToLogin(true);
        navigate('/epoch/login')
      })
    }
  }, [postId])


  if(!user) {
      return <Spinner />
  }

  if(redirectToLogin) {
    navigate('/epoch/login');
    return <div><h2>User Not Signed In</h2></div>;
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
          <div className={"post-comments-page-container"}>
            <div className={'post-comments-page'}>
                <div className={"post-comments-page-wrapper"}>
                    <div className={"post-comments-page-feed"}>
            <div className={'comments-post-wrapper'}>
        {commentsPost && (<Post key={ commentsPost.post_id } post={commentsPost} postViewer={user} refreshFeed={refreshComments} setRefreshFeed={setRefreshComments} isInFavorites={false}></Post>)}
            </div>

      {(<button className={`new-comment-button ${showNewCommentPopup ? 'rotate' : ''}`}
                    onClick={() => setShowNewCommentPopup(!showNewCommentPopup)}>+</button>)}

                {comments && comments.length === 0 && <div className={"no-comments"}>No comments yet</div>}

            <div className={"comments-wrapper"}>
                {comments && (
                  comments.map((newComment, index) => <Comment key={newComment.comm_id} commentObject={newComment} commentViewer={user} refreshComments={refreshComments} setRefreshComments={setRefreshComments}></Comment>)
                )}
            </div>

                </div>


            </div>

        </div>
      </div>
      )}
      <PostPopup showPopup={showNewPostPopup} setShowPopup={setShowNewPostPopup} username={user.username} profilePic={user.profile_pic_data} refreshFeed={refreshFeed} setRefreshFeed={setRefreshFeed}/>
        <CommentPopup showPopup={showNewCommentPopup} setShowPopup={setShowNewCommentPopup} postId={postId} username={user.username} profilePic={user.profile_pic_data} refreshComments={refreshComments} setRefreshComments={setRefreshComments}/>
    </>
  )
}

export default Comments
