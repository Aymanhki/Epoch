import React, {useState} from 'react';
import {updateUser} from '../services/user';
import '../styles/EditProfilePopup.css';

function EditProfilePopup({onClose, user}) {
    const [formData, setFormData] = useState({
        username: user.username,
        displayname: user.name,
        bio: user.bio
    });
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);

    // Handler to update form data
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handler to submit form data
    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement logic to submit updated data

        let invalidUsername = false;
        let invalidDisplayname = false;
        let invalidPassword = false;


        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()-_+=|\\{}[\]:;<>,.?/~]).{8,254}$/;
        const usernameRegex = /^[a-zA-Z0-9_.@$-]{1,49}$/
        if (!formData.username.match(usernameRegex)) {
            alert('Username must be between 1 and 50 characters and can only contain letters, numbers, and the following special characters: . _ @ $ -');
            highlightField('usernameField');
            invalidUsername = true;
            return;
        }
        if (formData.displayname <= 0 || formData.displayname > 255) {
            alert('Name must be between 1 and 254 characters');
            invalidDisplayname = true;
            highlightField('displaynameField');
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
            //verify that the current password is correct
            if (formData.currentPassword != user.password) {
                alert('Current password is not correct');
                highlightField('currentPassword');
                invalidPassword = true;
                return;
            } else {
                if (!formData.newPassword.match(passwordRegex)) {
                    alert('Password must be between 1 and 254 characters, at least one uppercase letter, one lowercase letter, one number, and one special character');
                    highlightField('newPassword');
                    invalidPassword = true;
                    return
                } else {
                    newData.password = formData.newPassword
                }
            }
        }
        if (!invalidUsername && !invalidDisplayname && !invalidPassword) {

            updateUser(user.id, newData)
                .then(resolve => {
                    onClose();
                })
                .catch(error => {
                    console.log(error)
                })
        }
    };
    const highlightField = (fieldName) => {
        const inputField = document.getElementById(fieldName);
        if (inputField) {
            inputField.style.borderColor = 'red';
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
    return (
        <div className="edit-popup-overlay">
            <div className="edit-popup-content">
                <button className="close-button" onClick={onClose}>Close</button>
                <h1>Edit your profile</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="usernameField" name="username" value={formData.username}
                               onChange={handleInputChange}/>
                    </div>
                    <div>
                        <label htmlFor="displayname">Display Name:</label>

                        <input type="text" id="displaynameField" name="displayname" value={formData.displayname}
                               onChange={handleInputChange}/>

                    </div>
                    <div>
                        <label htmlFor="bio">Bio:</label>
                        <textarea id="bioField" name="bio" value={formData.bio} onChange={handleInputChange}/>
                    </div>
                    <div>
                        <label htmlFor="currentPassword">Current Password:</label>
                        <input type="password" id="currentPassword" name="currentPassword"
                               value={formData.currentPassword} onChange={handleInputChange}
                               disabled={!isPasswordChanging}/>
                    </div>
                    <div>
                        <label htmlFor="newPassword">New Password:</label>
                        <input type="password" id="newPassword" name="newPassword" value={formData.newPassword}
                               onChange={handleInputChange} disabled={!isPasswordChanging}/>
                    </div>
                    {!isPasswordChanging && (
                        <button type="button" onClick={handlePasswordChangeStart}>Change Password</button>
                    )}
                    {isPasswordChanging && (
                        <button type="button" onClick={handlePasswordChangeStart}>Cancel</button>
                    )}
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
}


export default EditProfilePopup;
