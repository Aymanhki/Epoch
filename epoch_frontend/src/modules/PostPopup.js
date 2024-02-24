import React from 'react'
import {useState, useEffect} from 'react';
import '../styles/PostPopup.css';
import SmartMedia from "./SmartMedia";
import {newPost} from "../services/post.js"
import {useSpring, animated} from 'react-spring';


export default function PostPopup({showPopup, setShowPopup, username, profilePic, refreshFeed, setRefreshFeed}) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [postText, setPostText] = useState(null);
    const fileInputRef = React.createRef();
    const [postNow, setPostNow] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedHour, setSelectedHour] = useState(null);
    const [postButtonPrompt, setPostButtonPrompt] = useState('Post');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [posting, setPosting] = useState(false);
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 30}, (_, index) => currentYear + index);
    const months = Array.from({length: 12}, (_, index) => index + 1);
    const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const days = Array.from({length: 31}, (_, index) => index + 1);
    const hours = ["12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"]
    const [hasUploadedFile, setHasUploadedFile] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            setUploadedFile(selectedFile);
            setHasUploadedFile(true);
        }

        setError(false);
    };

    const {transform: inTransform, opacity: inOpacity} = useSpring({
        opacity: showPopup ? 1 : 0,
        transform: `translateY(${showPopup ? 0 : 100}vh)`,
        config: {duration: 300, friction: 30},
    });

    const {transform: outTransform, opacity: outOpacity} = useSpring({
        opacity: showPopup ? 1 : 0,
        transform: `translateY(${showPopup ? 0 : -200}%)`,
        config: {duration: 500, friction: 50},
    });

    useEffect(() => {
        if (showPopup || postNow) {
            setSelectedYear(null);
            setSelectedMonth(null);
            setSelectedDay(null);
            setSelectedHour(null);
        }

        if (showPopup) {
            resetState();
        }
    }, []);

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
        if(!posting) {
            setUploadedFile(null);
            setShowPopup(false);
        }
    }

    const handleCheckboxChange = (e) => {
        if(!posting) {
            setPostNow(e.target.checked);
            setError(false);
        }
    };

    const handleRemoveMedia = () => {
        if(!posting) {
            setUploadedFile(null);
            setHasUploadedFile(false);
        }
    };

    const handlePost = () => {
        if(!posting) {
            let selectedDate;

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
                }

                selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay, hours, 0, 0, 0);

                if (selectedDate < new Date()) {
                    setErrorMessage('Date and time must be in the future');
                    setError(true);
                    return;
                }
            }

            if (!error) {
                setPosting(true)
                setPostButtonPrompt('Posting...');
                const postObject = {
                    postText: postText,
                    file: uploadedFile,
                    fileType: uploadedFile ? uploadedFile.type : null,
                    fileName: uploadedFile ? uploadedFile.name : null,
                    postNow: postNow,
                    selectedDate: postNow ? new Date() : selectedDate,
                    username: username,
                }

                newPost(postObject).then((resolve) => {
                    setPostButtonPrompt('Posted');
                    setSuccess(true);

                    setSuccessMessage('Post was successful');
                    setTimeout(() => {
                        setShowPopup(false);
                        resetState();
                    }, 2000);

                    setRefreshFeed(true);
                    setPosting(false);
                })
                    .catch((error) => {
                        setErrorMessage(error);
                        setError(true);
                        setPostButtonPrompt('Post');
                        setTimeout(() => {
                            setShowPopup(false);
                            resetState();
                        }, 2000);
                        setPosting(false)

                    })


            }
        }
    }

    return (
        <>
            <animated.div
                className="post-popup"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: showPopup ? inOpacity : outOpacity,
                    transform: showPopup ? inTransform : outTransform,
                }}
            >
                <div className={'overlay'} onClick={() => handleClosing()}/>
                <div className={'popup-content'}>

                    <div className={'popup-header'}>
                        <div className={'profile-photo-container'}>
                            <img className={'profile-photo'} src={profilePic} alt={'profile-photo'}/>
                        </div>
                        <p>{username}</p>
                    </div>

                    <div className={'popup-body'}>
                        <textarea placeholder={'What\'s on your mind?'} disabled={posting} className={`post-input-textarea ${posting ? 'disabled' : ''}` }
                                  value={postText || ''} onChange={(e) => {
                            setPostText(e.target.value);
                            setError(false);
                        }}/>

                        <div className={"media-upload-wrapper"}>
                            {hasUploadedFile && (
                                <button className="remove-media" onClick={handleRemoveMedia}>+</button>
                            )}
                            <div className={'uploaded-file-preview'} onClick={() => {
                                if(!posting) {
                                    if (!hasUploadedFile) {
                                        fileInputRef.current.click()
                                    }
                                }
                            }}>
                                <input
                                    type="file"
                                    accept="image/*, audio/*, video/*"
                                    onChange={handleFileChange}
                                    style={{display: 'none'}}
                                    ref={fileInputRef}
                                    name="file"
                                    id="file"
                                />

                                {uploadedFile ? (<SmartMedia file={uploadedFile}/>) :
                                    (<img src={process.env.PUBLIC_URL + '/images/placeholder.png'} alt={'placeholder'}
                                          className={'media-preview'}/>)
                                }
                            </div>
                        </div>

                        <div className={'schedule-checkbox-wrapper'}>
                            <input className={`schedule-checkbox ${postNow ? 'checked' : ''} ${posting ? 'disabled' : '' }`} type="checkbox"
                                   checked={postNow} onChange={handleCheckboxChange}/>
                            <label className={'schedule-checkbox-label'}>Do you want to post this now?</label>
                        </div>

                        <div className={'schedule-options'}>

                            <>
                                <select value={selectedYear || ''} onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setSelectedDay(null);
                                    setError(false);
                                }} className={`schedule-select ${(postNow || posting) ? 'disabled' : ''}`} disabled={postNow}>
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
                                }} className={`schedule-select ${(postNow || posting) ? 'disabled' : ''}`} disabled={postNow}>
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
                                }} className={`schedule-select ${(postNow || posting) ? 'disabled' : ''}`} disabled={postNow}>
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
                                }} className={`schedule-select ${(postNow || posting) ? 'disabled' : ''}`} disabled={postNow}>
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