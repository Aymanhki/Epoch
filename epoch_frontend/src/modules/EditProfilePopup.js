import React, {useState} from 'react';
import {updateUser} from '../services/user';
import '../styles/EditProfilePopup.css';
import {useSpring, animated} from 'react-spring';

function EditProfilePopup({onClose, user, showEditProfilePopup, setShowEditProfilePopup, refreshProfile, setRefreshProfile}) {
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

    const {transform: inTransform} = useSpring({
        transform: `translateY(${showEditProfilePopup ? 0 : 100}vh)`,
        config: {duration: 300},
    });

    const {transform: outTransform} = useSpring({
        transform: `translateY(${showEditProfilePopup ? 0 : -100}vh)`,
        config: {duration: 300},
    });

    // Handler to update form data
    const handleInputChange = (e) => {
        const {name, value} = e.target;
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

    // Handler to submit form data
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!saving) {

            let invalidUsername = false;
            let invalidDisplayname = false;
            let invalidPassword = false;
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()-_+=|\\{}[\]:;<>,.?/~]).{8,254}$/;
            const usernameRegex = /^[a-zA-Z0-9_.@$-]{1,49}$/

            if (!formData.username.match(usernameRegex)) {
                setUsernameErrorMessage('Username must be between 1 and 50 characters and can only contain letters, numbers, and the following special characters: . _ @ $ -');
                invalidUsername = true;
                setUsernameError(true);
            }

            if (formData.displayname <= 0 || formData.displayname > 255) {
                setDisplaynameErrorMessage('Name must be between 1 and 254 characters');
                invalidDisplayname = true;
                setDisplaynameError(true);
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
                    setPasswordErrorMessage('Current password is not correct');
                    invalidPassword = true;
                    setPasswordError(true);
                } else {
                    if (!formData.newPassword.match(passwordRegex)) {
                        setNewPasswordErrorMessage('Password must be between 1 and 254 characters, at least one uppercase letter, one lowercase letter, one number, and one special character');
                        invalidPassword = true;
                        setNewPasswordError(true);
                    } else {
                        newData.password = formData.newPassword
                    }
                }
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


        onClose();
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
                transform: showEditProfilePopup ? inTransform : outTransform,
                zIndex: 1000
            }}
        >
            <div className="edit-popup-overlay" onClick={() =>{resetBeforeClose(false) }}></div>
            <div className="edit-popup-content">
                <h1>Edit your profile</h1>

                <div className="edit-popup-form-container">

                    <form onSubmit={handleSubmit} className={"edit-popup-form-grid"}>

                    <div className={"edit-popup-username-container"}>
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="usernameField" name="username" value={formData.username}
                               onChange={handleInputChange} disabled={saving} className={"edit-popup-username-field"}/>

                        {usernameError && (
                            <div className="edit-popup-error">
                                {usernameErrorMessage}
                            </div>
                        )}
                    </div>

                    <div className={"edit-popup-display-name-container"}>
                        <label htmlFor="displayname">Display Name:</label>

                        <input type="text" id="displaynameField" name="displayname" value={formData.displayname}
                               onChange={handleInputChange} disabled={saving} className={"edit-popup-displayname-field"}/>

                        {displaynameError && (
                            <div className="edit-popup-error">
                                {displaynameErrorMessage}
                            </div>
                        )}
                    </div>


                    <div className={"edit-popup-bio-container"}>
                        <label htmlFor="bio">Bio:</label>
                        <textarea id="bioField" name="bio" value={formData.bio} onChange={handleInputChange} disabled={saving} className={"edit-popup-bio-field"}/>
                        {bioError && (
                            <div className="edit-popup-error">
                                {bioErrorMessage}
                            </div>
                        )}
                    </div>



                    <div className={"edit-popup-password-container"}>
                        <div className={"edit-popup-password-field-container"}>
                        <label htmlFor="currentPassword">Current Password:</label>
                        <input type="password" id="currentPassword" name="currentPassword"
                               value={formData.currentPassword} onChange={handleInputChange}
                               disabled={( (!isPasswordChanging) || saving )} className={"edit-popup-password-field"}/>
                            {passwordError && (
                                <div className="edit-popup-error">
                                    {passwordErrorMessage}
                                </div>
                            )}
                    </div>

                        <div className={"edit-popup-password-field-container"}>
                            <label htmlFor="newPassword">New Password:</label>
                            <input type="password" id="newPassword" name="newPassword" value={formData.newPassword}
                                   onChange={handleInputChange} disabled={( (!isPasswordChanging) || saving )} className={"edit-popup-password-field"}/>

                            {newPasswordError && (
                                <div className="edit-popup-error">
                                    {newPasswordErrorMessage}
                                </div>
                            )}
                        </div>

                    <div className={"edit-popup-password-change-button-container"}>
                        {!isPasswordChanging && (
                            <button type="button" onClick={handlePasswordChangeStart}>Change Password</button>
                        )}
                        {isPasswordChanging && (
                            <button type="button" onClick={handlePasswordChangeStart}>Cancel</button>
                        )}
                    </div>
                    </div>

                </form>
                </div>

                <div className="edit-popup-footer">
                    <button onClick={handleSubmit}>{saveButtonPrompt}</button>
                    <button onClick={() => {resetBeforeClose(false)}}>Cancel</button>
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
