import React, { useState } from 'react';
import { updateUser } from '../services/user';
import '../styles/EditProfilePopup.css';

function EditProfilePopup({ onClose, userInfo }) {
    // State variables to manage form data
    const [formData, setFormData] = useState({
        username: userInfo.username,
        displayname: userInfo.name,
        bio: userInfo.bio
    });

    // Handler to update form data
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handler to submit form data
    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement logic to submit updated data
        const newData = {
            userID: userInfo.id,
            username: formData.username,
            displayname: formData.displayname,
            bio: formData.bio
        };
        updateUser(userInfo.id, newData)
        onClose(); // Close the popup after submitting
    };
    
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-button" onClick={onClose}>Close</button>
                <h1>Edit Profile ID {userInfo.id}</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                    <label htmlFor="displayname">Display Name:</label>
                        <input type="text" id="displayname" name="displayname" value={formData.displayname} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bio">Bio:</label>
                        <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} />
                    </div>
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
}


export default EditProfilePopup;
