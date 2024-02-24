import React, { useState } from 'react';
import { updateUser } from '../services/user';
import '../styles/EditProfilePopup.css';

function EditProfilePopup({ onClose, user }) {
    const [isUsernameEditing, setIsUsernameEditing] = useState(false);
    const [isDisplaynameEditing, setIsDisplaynameEditing] = useState(false);
    const [isBioEditing, setIsBioEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user.username,
        displayname: user.name,
        bio: user.bio
    });
    
    // Handler to update form data
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleEditClick = (fieldName) => {
        if (fieldName === 'username') {
            setIsUsernameEditing(!isUsernameEditing);
        } else if (fieldName === 'bio') {
            setIsBioEditing(!isBioEditing);
        } else if (fieldName == 'displayname')
            setIsDisplaynameEditing(!isDisplaynameEditing)
    };

    // Handler to submit form data
    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement logic to submit updated data
        const newData = {
            userID: user.id,
            username: formData.username,
            displayname: formData.displayname,
            bio: formData.bio,
            password: user.password,
            created_at: user.created_at,
            profile_pic_id:  user.profile_pic_id,
            background_pic_id: 1
        };
        updateUser(user.id, newData)
            .then(resolve => {
                onClose();
            })
            .catch(error => {
                console.log(error)
            })
        onClose(); // Close the popup after submitting
    };
    
    return (
        <div className="edit-popup-overlay">
            <div className="edit-popup-content">
                <button className="close-button" onClick={onClose}>Close</button>
                <h1>Edit {user.username} Profile ID {user.id}</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Username:</label>
                        {isUsernameEditing ? (
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} />
                        ) : (
                            <div>{formData.username}</div>
                        )}
                        <button type="button" onClick={() => handleEditClick('username')}>
                            {isUsernameEditing ? 'Save' : 'Edit'}
                        </button>
                        
                    </div>
                    <div>
                        <label htmlFor="displayname">Display Name:</label>
                        {isDisplaynameEditing ? (
                            <input type="text" id="displayname" name="displayname" value={formData.displayname} onChange={handleInputChange} />
                        ) : (
                            <div>{formData.displayname}</div>
                        )}
                        <button type="button" onClick={() => handleEditClick('displayname')}>
                            {isUsernameEditing ? 'Save' : 'Edit'}
                        </button>   
                    </div>
                    <div>
                        <label htmlFor="bio">Bio:</label>
                        {isBioEditing ? (
                            <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} />
                        ) : (
                            <div>{formData.bio}</div>
                        )}
                        <button type="button" onClick={() => handleEditClick('bio')}>
                            {isUsernameEditing ? 'Save' : 'Edit'}
                        </button> 
                        
                    </div>
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
}


export default EditProfilePopup;
