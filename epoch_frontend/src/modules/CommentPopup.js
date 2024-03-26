import {useSpring} from "react-spring";
import {animated} from "react-spring";
import {useState} from "react";
import React from "react";
import '../styles/CommentPopup.css';
import {addComment} from "../services/comments";


export default function CommentPopup({
                                      showPopup,
                                      setShowPopup,
                                      username,
                                      profilePic,
                                      refreshComments,
                                      setRefreshComments,
                                      postId,
                                  }) {

    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [commenting, setCommenting] = useState(false);
    const [commentButtonPrompt, setCommentButtonPrompt] = useState('Comment');

    const {transform: inTransform, opacity: inOpacity} = useSpring({
        opacity: showPopup ? 1 : 0,
        transform: `translateY(${showPopup ? 0 : 100}vh)`,
        config: {duration: 300},
    });

    const {transform: outTransform, opacity: outOpacity} = useSpring({
        opacity: showPopup ? 1 : 0,
        transform: `translateY(${showPopup ? 0 : -100}vh)`,
        config: {duration: 300},
    });

    const handleClosing = () => {
        setError(false);
        setErrorMessage('');
        setCommentText('');
        setCommenting(false);
        setShowPopup(false);
        setCommentButtonPrompt('Comment')
    }

    const handleComment = () => {
        if (commentText.length === 0) {
            setError(true);
            setErrorMessage('Comment cannot be empty');
            return;
        }

        if(commentText.length > 240) {
            setError(true);
            setErrorMessage('Comment cannot exceed 240 characters');
            return;
        }

        if(commenting) {return;}

        setCommenting(true);
        setCommentButtonPrompt('Commenting...');
        const now = new Date();
        const today = now.toISOString();

        const commentObject = {
            username: username,
            post_id: postId,
            comment: commentText,
            createdAt: today,
        };

        addComment(commentObject)
            .then(() => {
                setCommenting(false);
                setCommentText('');
                setShowPopup(false);
                setRefreshComments(!refreshComments);
            })
            .catch((error) => {
                setCommenting(false);
                setError(true);
                setErrorMessage(error);
            });
    }


    return (
        <>
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
                    opacity: showPopup ? inOpacity : outOpacity,
                    transform: showPopup ? inTransform : outTransform,
                    zIndex: 1000
                }}
            >
                <div className={'comment-popup-overlay'} onClick={() => handleClosing()}/>

                <div className={'comment-popup-content'}>

                    <div className={'comment-popup-header'}>
                        <div className={'comment-popup-profile-photo-container'}>
                            <img className={'comment-popup-profile-photo'} src={profilePic} alt={'profile-pic'}/>
                        </div>
                        <p className={'comment-popup-header-username'}>{username}</p>
                    </div>

                    <div className={'comment-popup-body'}>
                        <textarea placeholder={'What\'s on your mind?'} disabled={commenting}
                                  className={`comment-input-textarea ${commenting ? 'disabled' : ''}`}
                                  value={commentText || ''} onChange={(e) => {

                                      if(e.target.value.length < 240) {
                                         setCommentText(e.target.value);
                                         setError(false);
                                         setErrorMessage('');
                                      }
                                      else
                                      {
                                          setError(true);
                                          setErrorMessage('Comment cannot exceed 240 characters');
                                      }
                        }}/>
                    </div>

                    <div className={'comment-popup-footer'}>
                        <button className={'comment-button'} onClick={() => handleComment()}>{commentButtonPrompt}</button>
                        <button onClick={() => handleClosing()} className={'comment-popup-cancel-button'}>Cancel</button>

                        <div className={'comment-popup-prompt-wrapper'}>
                            {error && (<div className={`comment-popup-error-prompt`}>{errorMessage}</div>)}
                        </div>
                    </div>
                </div>

            </animated.div>
        </>
    )
}