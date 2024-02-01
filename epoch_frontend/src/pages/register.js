import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import '../styles/Register.css';
import {removeSessionCookie, uploadFile, registerUser} from '../services/user';


function Register() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [registeringPrompt, setRegisteringPrompt] = useState('Register');
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [generalError, setGeneralError] = useState(false);
    const fileInputRef = React.createRef();

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        setProfilePic(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setNameError(true);
            return;
        }

        if (!username.trim()) {
            setUsernameError(true);
            return;
        }

        if (!password.trim()) {
            setPasswordError(true);
            return;
        }

        setRegisteringPrompt('Registering...');
        removeSessionCookie();
        var userObject;

        if (profilePic)
        {
            setRegisteringPrompt('Uploading...');
            uploadFile(profilePic)
                .then((success) => {

                    setRegisteringPrompt('Almost there...')

                    userObject = {
                        name: name,
                        username: username,
                        password: password,
                        bio: bio,
                        profile_pic_id: success.media_id
                    };


                    registerUser(userObject)
                        .then((success) => {
                        setRegisteringPrompt('Ok');
                        window.location.href = "/epoch/profile";
                    })
                        .catch((error) => {
                        setRegisteringPrompt('Register');
                        setGeneralError(error);
                    });

                }).catch(() => {
                setRegisteringPrompt('Register');
                setGeneralError(true);
            });
        }
        else
        {
            userObject = {
                name: name,
                username: username,
                password: password,
                bio: bio,
                profile_pic_id: 1
            };

            setRegisteringPrompt('Hang on...')

            registerUser(userObject)
                .then((success) => {
                setRegisteringPrompt('Ok');
                window.location.href = "/epoch/profile";
            })
                .catch((error) => {
                setRegisteringPrompt('Register');
                setGeneralError(error);
            });
        }
    };


    return (
        <div className="register-container">
                <div className="register-form">
                    <form onSubmit={handleSubmit}>
                        <h1 style={{
                            fontSize: '32px',
                            marginBottom: '20px',
                            fontFamily: 'Futura',
                            fontWeight: 'bold',
                            textAlign: 'left',
                            alignSelf: 'flex-start'
                        }}>{registeringPrompt}</h1>

                        <div className="profile-pic-upload-container" >

                            <div className="profile-pic-upload">
                                {profilePic ? (
                                    <img src={typeof profilePic === 'string' ? profilePic : URL.createObjectURL(profilePic)} alt="Profile Pic" />
                                ) : (
                                    <img src={process.env.PUBLIC_URL + '/images/default_pfp.png'} alt="Default Profile Pic" />
                                )}
                            </div>

                            <div className="plus-sign" onClick={() => fileInputRef.current.click()}>+</div>

                            <input
                                type="file"
                                id="profilePic"
                                name="profilePic"
                                accept="image/*"
                                ref={fileInputRef} // Attach the ref to the file input
                                style={{display: 'none'}} // Hide the file input
                                onChange={handleProfilePicChange}
                            />
                        </div>


                        <label htmlFor="name">Name {nameError && <span style={{color: 'red'}}>*</span>}
                            {nameError && !name.trim() &&
                                <span style={{color: 'red', marginLeft: '5px', marginBottom: '5px'}}>Name field cannot be empty</span>}
                        </label>

                        <input type="text" id="name" name="name" value={name} onChange={(e) => {
                            setName(e.target.value);
                            setNameError(false);
                            setGeneralError(false);
                        }} onBlur={() => {
                            setNameError(!name.trim());
                            setGeneralError(false);
                        }}/>

                        <label htmlFor="bio">Bio</label>
                        <textarea className="bio-textarea" id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)}/>

                        <label htmlFor="username">Username {usernameError && <span style={{color: 'red'}}>*</span>}
                            {usernameError && !username.trim() &&
                                <span
                                    style={{color: 'red', marginLeft: '5px', marginBottom: '5px'}}>Username field cannot be empty</span>}
                        </label>

                        <input type="text" id="username" name="username" value={username} onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError(false);
                            setGeneralError(false);
                        }} onBlur={() => {
                            setUsernameError(!username.trim());
                            setGeneralError(false);
                        }}/>

                        <label htmlFor="password">Password {passwordError && <span style={{color: 'red'}}>*</span>}
                            {passwordError && !password.trim() &&
                                <span
                                    style={{color: 'red', marginLeft: '5px', marginBottom: '5px'}}>Password field cannot be empty</span>}
                        </label>

                        <input type="password" id="password" name="password" value={password} onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                            setGeneralError(false);
                        }} onBlur={() => {
                            setPasswordError(!password.trim());
                            setGeneralError(false);
                        }}/>

                        {generalError &&
                            <span style={{color: 'red', marginLeft: '5px', marginBottom: '5px'}}>Could not register</span>}

                        <button type="submit" className={"register-button"}>{registeringPrompt}</button>

                        <p style={{textAlign: 'center', marginTop: '10px'}}>
                            Already have an account?{' '}
                            <Link
                                to="/epoch/login"
                                style={{
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    color: '#1a2a6c',
                                }}
                            >
                                Log in here
                            </Link>
                        </p>
                    </form>
                </div>
        </div>
    );
}

export default Register;
