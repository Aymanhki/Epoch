import React from 'react'
import {useState, useEffect} from 'react';
import '../styles/PostPopup.css';
import SmartMedia from "./SmartMedia";
import {newPost, updatePost} from "../services/post.js"
import {useSpring, animated} from 'react-spring';
import {useNavigate} from "react-router-dom";


export default function PostPopup({
                                      showPopup,
                                      setShowPopup,
                                      username,
                                      profilePic,
                                      refreshFeed,
                                      setRefreshFeed,
                                      editPost,
                                      caption,
                                      postFile,
                                      year,
                                      month,
                                      day,
                                      hour,
                                      postId,
                                      userId
                                  }) {
    const maxImageBytes = 30000001;
    const maxVideoBytes = 300000001;
    const allowedFileTypes = ["jpg", "jpeg", "png", "mp4", "mp3", "gif"]
    const [uploadedFile, setUploadedFile] = useState((editPost && postFile) ? postFile : null);
    const [postText, setPostText] = useState((editPost && caption) ? caption : null);
    const [postNow, setPostNow] = useState(false);
    const [selectedYear, setSelectedYear] = useState((editPost && year) ? year : null);
    const [selectedMonth, setSelectedMonth] = useState((editPost && month) ? month : null);
    const [selectedDay, setSelectedDay] = useState((editPost && day) ? day : null);
    const [selectedHour, setSelectedHour] = useState((editPost && hour) ? hour : null);
    const [postButtonPrompt, setPostButtonPrompt] = useState((editPost) ? 'Save' : 'Post');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [posting, setPosting] = useState(false);
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 100}, (_, index) => currentYear + index);
    const months = Array.from({length: 12}, (_, index) => index + 1);
    const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const days = Array.from({length: 31}, (_, index) => index + 1);
    const hours = ["12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"]
    const [hasUploadedFile, setHasUploadedFile] = useState((editPost && postFile) ? true : false);
    const [editPostFileChanged, setEditPostFileChanged] = useState(false);
    const [editPostFileRemoved, setEditPostFileRemoved] = useState(false);
    const checkBoxRef = React.createRef();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            if (!allowedFileTypes.includes(selectedFile.type.split('/')[1]) ) {
                alert("Unsupported file type, try: .jpg, .jepg, .png, .mp4, .mp3, .gif");
                setError(true);
                setErrorMessage("Unsupported file type, try: .jpg, .jepg, .png, .mp4, .mp3, .gif");
            }
            else if (selectedFile.size > maxImageBytes && selectedFile.type.split('/')[1] !== ".mp4") {
                alert("Image File Size too Big: Max Image Size is 30Mb");
                setError(true);
                setErrorMessage("Image File Size too Big: ", selectedFile.size, " > 30Mb" );
            }
            else if (selectedFile.size > maxVideoBytes && selectedFile.type.split('/')[1] === ".mp4") {
                alert("Video File Size too Big: Max Video Size is 300Mb");
                setError(true);
                setErrorMessage("Video File Size too Big: ", selectedFile.size, " > 300Mb");
            }
            else {
                setUploadedFile(selectedFile);
                setHasUploadedFile(true);

                if (editPost) {
                    setEditPostFileChanged(true);
                }
            }
        }

        setError(false);
    };

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


    useEffect(() => {
        if (postNow && !editPost) {
            setSelectedYear(null);
            setSelectedMonth(null);
            setSelectedDay(null);
            setSelectedHour(null);
        }

    }, [postNow, editPost]);

    useEffect(() => {
        if (showPopup && !editPost) {
            resetState();
        }
    }, [showPopup, editPost]);

    const resetState = () => {
        setPostButtonPrompt('Post');
        setPostText(null);
        setUploadedFile(null);
        setError(false);
        setSuccess(false);
        setSuccessMessage('');
        setErrorMessage('');
        setSelectedYear(null);
        setSelectedMonth(null);
        setSelectedDay(null);
        setSelectedHour(null);
        setHasUploadedFile(false);
    }

    const handleClosing = () => {
        if (!posting) {
            setUploadedFile(null);
            setShowPopup(false);
        }
    }

    const handleCheckboxChange = (e) => {
        if (!posting) {
            setPostNow(e.target.checked);
            setError(false);
        }
    };

    const handleRemoveMedia = () => {
        if (!posting) {
            setUploadedFile(null);
            setHasUploadedFile(false);

            if (editPost && postFile) {
                setEditPostFileRemoved(true);
            }
        }
    };

    const handlePost = () => {
        if (!posting) {
            let selectedDate;
            const now = new Date();
            const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()));

            if (!postText && !uploadedFile) {
                setErrorMessage('Post text or media file is required');
                setError(true);
                return;
            }

            if (postText && postText.length < 0) {
                setErrorMessage('Post text is too short');
                setError(true);
                return;
            }

            if (postNow === false) {
                if (!selectedYear || !selectedMonth || !selectedDay || !selectedHour) {
                    setErrorMessage('Date and time must be selected');
                    setError(true);
                    return;
                }


                let hours = selectedHour.split(':')[0];

                if (selectedHour.includes('PM')) {
                    hours = parseInt(hours) + 12;
                } else {
                    hours = parseInt(hours);
                }

                setSelectedDay(parseInt(selectedDay))
                setSelectedMonth(parseInt(selectedMonth))
                setSelectedYear(parseInt(selectedYear))

                selectedDate = new Date(Date.UTC(selectedYear, selectedMonth - 1, selectedDay, hours, 0, 0, 0));

                if (selectedDate < today) {
                    setErrorMessage('Date and time must be in the future');
                    setError(true);
                    return;
                }
            }

            if (!error) {
                setPosting(true)

                if (!editPost) {
                    setPostButtonPrompt('Posting...');
                    const postObject = {
                        postText: postText,
                        file: uploadedFile,
                        fileType: uploadedFile ? uploadedFile.type : null,
                        fileName: uploadedFile ? uploadedFile.name : null,
                        postNow: postNow,
                        selectedDate: postNow ? today : selectedDate,
                        createdAt: today,
                        username: username,
                    }

                    newPost(postObject).then((resolve) => {
                        setPostButtonPrompt('Posted');
                        setSuccess(true);

                        setSuccessMessage('Post was successful');
                        setTimeout(() => {
                            setShowPopup(false);
                            resetState();
                            setRefreshFeed(true);
                        }, 2000);


                        setPosting(false);
                    })
                        .catch((error) => {              
                            if (error.startsWith("No session cookie found") || error.startsWith("Connection refused")) {
                                // if not logged in or session expired a reload will kick them back to login but only if thats the error we get
                                window.location.reload();
                            }
                            setPosting(false);
                            resetState();
                            setErrorMessage(error);
                            setError(true);
                        })
                } else {
                    setPostButtonPrompt('Saving...');
                    const postObject = {
                        postText: postText,
                        file: editPostFileChanged ? uploadedFile : null,
                        fileType: uploadedFile ? uploadedFile.type : null,
                        fileName: uploadedFile ? uploadedFile.name : null,
                        oldFileRemoved: editPostFileRemoved,
                        postNow: postNow,
                        selectedDate: postNow ? today : selectedDate,
                        createdAt: today,
                        username: username,
                        postId: postId
                    }

                    updatePost(postObject, userId).then((resolve) => {
                        setPostButtonPrompt('Saved');
                        setSuccess(true);

                        setSuccessMessage('Post was updated');
                        setTimeout(() => {
                            setShowPopup(false);
                            resetState();
                            setRefreshFeed(true);
                            navigate("/epoch/profile");
                        }, 2000);

                        setPosting(false);
                    })
                        .catch((error) => {
                            if (error.startsWith("No session cookie found") || error.startsWith("Connection refused")) {
                                // if not logged in or session expired a reload will kick them back to login 
                                window.location.reload();
                            }
                            setPosting(false)
                            resetState();
                            setErrorMessage(error);
                            setError(true);
                        })
                }
            }
        }
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
                <div className={'overlay'} onClick={() => handleClosing()}/>
                <div className={'popup-content'}>

                    <div className={'popup-header'}>
                        <div className={'profile-photo-container'}>
                            <img className={'profile-photo'} src={profilePic} alt={'profile-pic'}/>
                        </div>
                        <p className={'popup-header-username'}>{username}</p>
                    </div>

                    <div className={'popup-body'}>
                        <textarea placeholder={'What\'s on your mind?'} disabled={posting}
                                  className={`post-input-textarea ${posting ? 'disabled' : ''}`}
                                  value={postText || ''} onChange={(e) => {
                            setPostText(e.target.value);
                            setError(false);
                        }}/>

                        <div className={"media-upload-wrapper"}>
                            {hasUploadedFile && (
                                <button className="remove-media" onClick={handleRemoveMedia}>+</button>
                            )}
                            <div className={'uploaded-file-preview'}>
                                <input
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.mp4,.mp3,.gif"
                                    onChange={handleFileChange}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        opacity: 0,
                                        cursor: 'pointer',
                                        display: posting ? 'none' : 'block'
                                    }}
                                    name="file"
                                    id="file"
                                    disabled={hasUploadedFile || posting}
                                />

                                {uploadedFile ? (<SmartMedia file={uploadedFile} className={'media-preview'}/>) :
                                    (<img src={process.env.PUBLIC_URL + '/images/placeholder.png'} alt={'placeholder'}
                                          className={'media-preview'}/>)
                                }
                            </div>
                        </div>

                        <div className={'schedule-checkbox-wrapper'}>
                            <input
                                className={`schedule-checkbox ${postNow ? 'checked' : ''} ${posting ? 'disabled' : ''}`}
                                type="checkbox" ref={checkBoxRef}
                                checked={postNow} onChange={handleCheckboxChange}/>
                            <label className={'schedule-checkbox-label'} onClick={() => {checkBoxRef.current.click()}}>Do you want to post this now?</label>
                        </div>

                        <div className={'schedule-options'}>

                            <>
                                <select value={selectedYear || ''} onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setSelectedDay(null);
                                    setError(false);
                                }} className={`schedule-select ${(postNow || posting) ? 'disabled' : ''}`}
                                        disabled={postNow}>
                                    <option value="">Select Year</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <select value={selectedMonth || ''} onChange={(e) => {
                                    setSelectedMonth(e.target.value);
                                    setSelectedDay(null);
                                    setError(false);
                                }} className={`schedule-select ${(postNow || posting) ? 'disabled' : ''}`}
                                        disabled={postNow}>
                                    <option value="">Select Month</option>
                                    {months.map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                                <select value={selectedDay || ''} onChange={(e) => {
                                    setSelectedDay(e.target.value);
                                    setError(false);
                                }} className={`schedule-select ${(postNow || posting) ? 'disabled' : ''}`}
                                        disabled={postNow}>
                                    <option value="">Select Day</option>
                                    {days.slice(0, daysInMonth(selectedYear, selectedMonth)).map((day) => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                                <select value={selectedHour || ''} onChange={(e) => {
                                    setSelectedHour(e.target.value);
                                    setError(false);
                                }} className={`schedule-select ${(postNow || posting) ? 'disabled' : ''}`}
                                        disabled={postNow}>
                                    <option value="">Select Hour</option>
                                    {hours.map((hour) => (
                                        <option key={hour} value={hour}>
                                            {hour}
                                        </option>
                                    ))}
                                </select>
                            </>

                        </div>
                    </div>

                    <div className={'popup-footer'}>
                        <button className={'post-button'} onClick={() => handlePost()}>{postButtonPrompt}</button>
                        <button onClick={() => handleClosing()} className={'cancel-button'}>Cancel</button>

                        <div className={'prompts-wrapper'}>
                            {error && (<div className={`error-prompt`}>{errorMessage}</div>)}
                            {success && (<div className={`success-prompt`}>{successMessage}</div>)}
                        </div>
                    </div>

                </div>
            </animated.div>
        </>
    )

}