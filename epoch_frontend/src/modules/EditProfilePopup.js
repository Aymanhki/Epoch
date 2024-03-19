import React, {useState, useRef, useEffect} from 'react';
import {updateUser} from '../services/user';
import '../styles/EditProfilePopup.css';
import {useSpring, animated} from 'react-spring';

function EditProfilePopup({onClose, user, showEditProfilePopup, setShowEditProfilePopup, refreshProfile, setRefreshProfile, profilePicId, profilePicUrl, profilePicName, profilePicType, backgroundPicId, backgroundPicUrl, backgroundPicName, backgroundPicType}) {
    const [formData, setFormData] = useState({
        username: user.username,
        displayname: user.name,
        bio: user.bio
    });
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
    const [displaynameError, setDisplaynameError] = useState(false);
    const [displaynameErrorMessage, setDisplaynameErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState('');
    const [bioError, setBioError] = useState(false);
    const [bioErrorMessage, setBioErrorMessage] = useState('');
    const [generalError, setGeneralError] = useState(false);
    const [generalErrorMessage, setGeneralErrorMessage] = useState('');
    const [saveButtonPrompt, setSaveButtonPrompt] = useState('Save');
    const [saving, setSaving] = useState(false);
    const [formDataChanged, setFormDataChanged] = useState(false);
    const profilePicInputRef = React.createRef();
    const backgroundPicInputRef = React.createRef();
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [backgroundPicFile, setBackgroundPicFile] = useState(null);
    const [removableProfilePic, setRemovableProfilePic] = useState(profilePicId !== 1 && profilePicId !== 2 && profilePicId !== null);
    const [removableBackgroundPic, setRemovableBackgroundPic] = useState(backgroundPicId !== 1 && backgroundPicId !== 2 && backgroundPicId !== null);
    const [removedOldProfilePic, setRemovedOldProfilePic] = useState(false);
    const [removedOldBackgroundPic, setRemovedOldBackgroundPic] = useState(false);
    const usernameRef = useRef(null);
    const displaynameRef = useRef(null);
    const bioRef = useRef(null);
    const currentPasswordRef = useRef(null);
    const newPasswordRef = useRef(null);
    const maxImageBytes = 30000001;
    const maxVideoBytes = 200000001;
    const allowedFileTypes = ["jpg", "jpeg", "png", "mp4", "mp3", "gif"]


    const {transform: inTransform, opacity: inOpacity} = useSpring({
        opacity: showEditProfilePopup ? 1 : 0,
        transform: `translateY(${showEditProfilePopup ? 0 : 100}vh)`,
        config: {duration: 300},
    });

    const {transform: outTransform, opacity: outOpacity} = useSpring({
        opacity: showEditProfilePopup ? 1 : 0,
        transform: `translateY(${showEditProfilePopup ? 0 : -100}vh)`,
        config: {duration: 300},
    });

    useEffect(() => {
        if (showEditProfilePopup) {
            setFormData({
                username: user.username,
                displayname: user.name,
                bio: user.bio
            });
            setProfilePicFile(null);
            setBackgroundPicFile(null);
            setRemovableProfilePic(profilePicId !== 1 && profilePicId !== 2 && profilePicId !== null);
            setRemovableBackgroundPic(backgroundPicId !== 1 && backgroundPicId !== 2 && backgroundPicId !== null);
            setRemovedOldProfilePic(false);
            setRemovedOldBackgroundPic(false);
            setGeneralError(false);
            setGeneralErrorMessage('');
            setFormDataChanged(false);
        }
    }, [showEditProfilePopup]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;

        // if the bio is being changes, nothing should happen if the length is greater than 240

        if (name === 'bio' && value.length > 240) {
            setBioError(true);
            setBioErrorMessage('Bio must be less than 240 characters');
            bioRef.current.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'username') {
            setUsernameError(false);
            setUsernameErrorMessage('');
        } else if (name === 'displayname') {
            setDisplaynameError(false);
            setDisplaynameErrorMessage('');
        } else if (name === 'currentPassword') {
            setPasswordError(false);
            setPasswordErrorMessage('');
        } else if (name === 'newPassword') {
            setNewPasswordError(false);
            setNewPasswordErrorMessage('');
        } else if (name === 'bio') {
            setBioError(false);
            setBioErrorMessage('');
        }

        setGeneralErrorMessage('');
        setGeneralError(false);

        setFormDataChanged(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!saving) {

            let invalidUsername = false;
            let invalidDisplayname = false;
            let invalidPassword = false;
            let invalidBio = false;
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()-_+=|\\{}[\]:;<>,.?/~]).{8,254}$/;
            const usernameRegex = /^[a-zA-Z0-9_.@$-]{1,49}$/

            if (!formData.username.match(usernameRegex)) {
                invalidUsername = true;
                setUsernameError(true);
                setUsernameErrorMessage('Username must be between 1 and 50 characters and can only contain letters, numbers, and the following special characters: . _ @ $ -');
                usernameRef.current.scrollIntoView({ behavior: 'smooth' });
                usernameRef.current.focus();
                return;
            }

            if (formData.displayname <= 0 || formData.displayname > 255) {
                invalidDisplayname = true;
                setDisplaynameError(true);
                setDisplaynameErrorMessage('Name must be between 1 and 254 characters');
                displaynameRef.current.scrollIntoView({ behavior: 'smooth' });
                displaynameRef.current.focus();
                return;
            }

            if (formData.bio > 240) {
                invalidBio = true;
                setBioError(true);
                setBioErrorMessage('Bio must be less than 240 characters');
                bioRef.current.scrollIntoView({ behavior: 'smooth' });
                bioRef.current.focus();
                return;
            }

            const newData = {
                userID: user.id,
                username: formData.username,
                displayname: formData.displayname,
                bio: formData.bio,
                password: user.password,
                created_at: user.created_at,
                profile_pic_id: user.profile_pic_id,
                background_pic_id: user.background_pic_id
            };

            if (isPasswordChanging) {
                if (formData.currentPassword !== user.password) {
                    invalidPassword = true;
                    setPasswordError(true);
                    setPasswordErrorMessage('Current password is not correct');
                    currentPasswordRef.current.scrollIntoView({ behavior: 'smooth' });
                    currentPasswordRef.current.focus();
                    return;
                } else {
                    if (!formData.newPassword.match(passwordRegex)) {
                        invalidPassword = true;
                        setNewPasswordError(true);
                        setNewPasswordErrorMessage('Password must be between 1 and 254 characters, at least one uppercase letter, one lowercase letter, one number, and one special character');
                        newPasswordRef.current.scrollIntoView({ behavior: 'smooth' });
                        newPasswordRef.current.focus();
                        return;
                    } else {
                        newData.password = formData.newPassword
                    }
                }
            }

            if (profilePicFile && profilePicFile !== null && profilePicFile !== undefined && removableProfilePic) {
                newData.new_profile_pic = profilePicFile;
                newData.new_profile_pic_type = profilePicFile.type;
                newData.new_profile_pic_name = profilePicFile.name;
                newData.profile_pic_id = -1;
            }
            else
            {
                newData.new_profile_pic = null;
                newData.new_profile_pic_type = null;
                newData.new_profile_pic_name = null;
                newData.profile_pic_id = profilePicId;
            }

            if (backgroundPicFile && backgroundPicFile !== null && backgroundPicFile !== undefined && removableBackgroundPic) {
                newData.new_background_pic = backgroundPicFile;
                newData.new_background_pic_type = backgroundPicFile.type;
                newData.new_background_pic_name = backgroundPicFile.name;
                newData.background_pic_id = -1;
            }
            else
            {
                newData.new_background_pic = null;
                newData.new_background_pic_type = null;
                newData.new_background_pic_name = null;
                newData.background_pic_id = backgroundPicId;
            }

            if(removedOldProfilePic)
            {
                newData.removed_old_profile_pic = true;
                newData.profile_pic_id = -1;
            }

            if(removedOldBackgroundPic)
            {
                newData.removed_old_background_pic = true;
                newData.background_pic_id = -1;
            }

            if (!invalidUsername && !invalidDisplayname && !invalidPassword && formDataChanged) {
                setSaving(true);
                setSaveButtonPrompt('Saving...');
                updateUser(user.id, newData)
                    .then(resolve => {
                        resetBeforeClose(true);
                        setRefreshProfile(true);
                        setSaving(false);
                        setSaveButtonPrompt('Save');
                    })
                    .catch(error => {
                        setGeneralErrorMessage(error)
                        setGeneralError(true);
                        setSaving(false);
                        setSaveButtonPrompt('Save');
                    })
            }
            else if(!formDataChanged) {
                resetBeforeClose(false);
            }
        }
    };

    const handlePasswordChangeStart = () => {
        setIsPasswordChanging(!isPasswordChanging);
        setFormData({
            ...formData,
            currentPassword: '',
            newPassword: ''
        });
    };

    const resetBeforeClose = (saved) => {
        if (saving) {return;}

        if(!saved) {
            setFormData({
                username: user.username,
                displayname: user.name,
                bio: user.bio,
                currentPassword: '',
                newPassword: ''
            });
        }
        else {
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: ''
            });
        }
        setUsernameError(false);
        setDisplaynameError(false);
        setPasswordError(false);
        setNewPasswordError(false);
        setBioError(false);
        setGeneralError(false);
        setGeneralErrorMessage('');
        setSaveButtonPrompt('Save');
        setSaving(false);
        setShowEditProfilePopup(false);
        setIsPasswordChanging(false);
        setFormDataChanged(false);
        setProfilePicFile(null);
        setBackgroundPicFile(null);
        setRemovableProfilePic(false);
        setRemovableBackgroundPic(false);
        setRemovedOldProfilePic(false);
        setRemovedOldBackgroundPic(false);
        onClose();
    }

    const onRemoveProfilePic = () => {
        setProfilePicFile(null);
        setRemovableProfilePic(false);
        setRemovedOldProfilePic(true);
        setFormDataChanged(true);
    }

    const onRemoveBackgroundPic = () => {
        setBackgroundPicFile(null);
        setRemovableBackgroundPic(false);
        setRemovedOldBackgroundPic(true);
        setFormDataChanged(true);
    }

    const onProfilePicChange = (e) => {
        const file = e.target.files[0];

        if(!file) {return;}
        if (!allowedFileTypes.includes(file.type.split('/')[1]) ) {
            alert("Unsupported file type, try: .jpg, .jepg, .png, .mp4, .mp3, .gif");
        }
        else if (file.size > maxImageBytes && file.type.split('/')[1] !== "mp4") {
            alert("Image File Size too Big: Max Image Size is 30Mb");
        }
        else if (file.size > maxVideoBytes && file.type.split('/')[1] === "mp4") {
            alert("Video File Size too Big: Max Video Size is 200Mb");
        }
        else {
            setProfilePicFile(file);
            setRemovableProfilePic(true);
            setFormDataChanged(true);
        }
    }

    const onBackgroundPicChange = (e) => {
        const file = e.target.files[0];

        if(!file) {return;}
        if (!allowedFileTypes.includes(file.type.split('/')[1]) ) {
            alert("Unsupported file type, try: .jpg, .jepg, .png, .mp4, .mp3, .gif");
        }
        else if (file.size > maxImageBytes && file.type.split('/')[1] !== "mp4") {
            alert("Image File Size too Big: Max Image Size is 30Mb");
        }
        else if (file.size > maxVideoBytes && file.type.split('/')[1] === "mp4") {
            alert("Video File Size too Big: Max Video Size is 200Mb");
        }
        else {
            setBackgroundPicFile(file);
            setRemovableBackgroundPic(true);
            setFormDataChanged(true);
        }
    }

    return (

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
                opacity: showEditProfilePopup ? inOpacity : outOpacity,
                transform: showEditProfilePopup ? inTransform : outTransform,
                zIndex: 1000
            }}
        >
            <div className="edit-popup-overlay" onClick={() =>{resetBeforeClose(false) }}></div>
            <div className="edit-popup-content">
                <h1>Edit your profile</h1>



                    <form onSubmit={handleSubmit} className={"edit-popup-form"}>
                        <div className={"edit-popup-form-fields-container"}>
                            <label htmlFor="username">Username:</label>
                            <div className={"edit-popup-username-container"}>

                                <input type="text" id="usernameField" name="username" value={formData.username}
                                       onChange={handleInputChange} disabled={saving}
                                       className={"edit-popup-username-field"} ref={usernameRef}/>

                                {usernameError && (
                                    <div className="edit-popup-error">
                                        {usernameErrorMessage}
                                    </div>
                                )}
                            </div>

                            <label htmlFor="displayname">Display Name:</label>
                            <div className={"edit-popup-display-name-container"}>


                                <input type="text" id="displaynameField" name="displayname" value={formData.displayname}
                                       onChange={handleInputChange} disabled={saving}
                                       className={"edit-popup-displayname-field"} ref={displaynameRef}/>

                                {displaynameError && (
                                    <div className="edit-popup-error">
                                        {displaynameErrorMessage}
                                    </div>
                                )}
                            </div>

                            <label htmlFor="bio">Bio:</label>
                            <div className={"edit-popup-bio-container"}>

                                <textarea id="bioField" name="bio" value={formData.bio} onChange={handleInputChange}
                                          disabled={saving} className={"edit-popup-bio-field"} ref={bioRef}/>
                                {bioError && (
                                    <div className="edit-popup-error">
                                        {bioErrorMessage}
                                    </div>
                                )}
                            </div>

                            <label htmlFor="profilePic">Profile Picture:</label>
                            <div className={"edit-popup-profile-pic-change-container"}>

                                <div className={"edit-popup-profile-pic-container"}>
                                    {removableProfilePic && !profilePicFile && (
                                        <img src={profilePicUrl} alt={profilePicName} className={"edit-popup-profile-pic"} />
                                    )}
                                    {profilePicFile && removableProfilePic && (
                                        <img src={URL.createObjectURL(profilePicFile)} alt={profilePicFile.name} className={"edit-popup-profile-pic"} />
                                    )}
                                    {!profilePicFile && !removableProfilePic && (
                                        <img src={process.env.PUBLIC_URL + '/images/default_pfp.png'} alt={"default profile photo"} className={"edit-popup-profile-pic"} />
                                    )}
                                </div>

                                {removableProfilePic ? (
                                    <button type="button" className={"edit-popup-profile-pic-remove-button"}
                                            onClick={onRemoveProfilePic} disabled={saving}>+
                                    </button>
                                ) : (
                                    <button type="button" className={"edit-popup-profile-pic-change-button"}
                                            onClick={() => {
                                                profilePicInputRef.current.click()
                                            }} disabled={saving}>+
                                    </button>
                                )}

                                <input type="file" id="profilePic" name="profilePic" accept="image/*" disabled={saving}
                                       className={"edit-popup-profile-pic-field"} style={{display: "none"}}
                                       ref={profilePicInputRef} onChange={onProfilePicChange}/>
                            </div>

                            <label htmlFor="backgroundPic">Background Picture:</label>
                            <div className={"edit-popup-background-pic-change-container"}>


                                <div className={"edit-popup-background-pic-container"}>
                                    {removableBackgroundPic && !backgroundPicFile && (
                                        <img src={backgroundPicUrl} alt={backgroundPicName} className={"edit-popup-background-pic"} />
                                    )}
                                    {backgroundPicFile && removableBackgroundPic && (
                                        <img src={URL.createObjectURL(backgroundPicFile)} alt={backgroundPicFile.name} className={"edit-popup-background-pic"} />
                                    )}
                                    {!backgroundPicFile && !removableBackgroundPic && (
                                        <img src={process.env.PUBLIC_URL + '/images/default_profile_background.png'} alt={"default background"} className={"edit-popup-background-pic"} />
                                    )}
                                    </div>

                                    {removableBackgroundPic ? (
                                        <button type="button" className={"edit-popup-background-pic-remove-button"}
                                                onClick={onRemoveBackgroundPic} disabled={saving}>+
                                        </button>
                                    ) : (
                                        <button type="button" className={"edit-popup-background-pic-change-button"}
                                                onClick={() => {
                                                    backgroundPicInputRef.current.click()
                                                }} disabled={saving}>+
                                        </button>
                                    )}

                                <input type="file" id="backgroundPic" name="backgroundPic" accept="image/*"
                                       disabled={saving} className={"edit-popup-background-pic-field"}
                                       style={{display: "none"}} ref={backgroundPicInputRef}
                                       onChange={onBackgroundPicChange}/>
                            </div>

                            <div className={"edit-popup-password-container"}>

                                <label htmlFor="currentPassword">Current Password:</label>
                                <div className={"edit-popup-password-field-container"}>

                                    <input type="password" id="currentPassword" name="currentPassword"
                                           value={formData.currentPassword} onChange={handleInputChange}
                                           disabled={((!isPasswordChanging) || saving)}
                                           className={"edit-popup-password-field"} ref={currentPasswordRef}/>
                                    {passwordError && (
                                        <div className="edit-popup-error">
                                            {passwordErrorMessage}
                                        </div>
                                    )}
                                </div>


                                <label htmlFor="newPassword">New Password:</label>
                                <div className={"edit-popup-password-field-container"}>

                                    <input type="password" id="newPassword" name="newPassword"
                                           value={formData.newPassword}
                                           onChange={handleInputChange} disabled={((!isPasswordChanging) || saving)}
                                           className={"edit-popup-password-field"} ref={newPasswordRef}/>

                                    {newPasswordError && (
                                        <div className="edit-popup-error">
                                            {newPasswordErrorMessage}
                                        </div>
                                    )}
                                </div>

                                <div className={"edit-popup-password-change-button-container"}>
                                    {!isPasswordChanging && (
                                        <button type="button" onClick={handlePasswordChangeStart}>Change
                                            Password</button>
                                    )}
                                    {isPasswordChanging && (
                                        <button type="button" onClick={handlePasswordChangeStart}>Cancel</button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </form>


                <div className="edit-popup-footer">
                    <button onClick={handleSubmit}>{saveButtonPrompt}</button>
                    <button onClick={() => {
                        resetBeforeClose(false)
                    }}>Cancel
                    </button>
                    {generalError && (
                        <div className="edit-popup-error">
                            {generalErrorMessage}
                        </div>
                    )}
                </div>
            </div>
        </animated.div>
    );
}


export default EditProfilePopup;
