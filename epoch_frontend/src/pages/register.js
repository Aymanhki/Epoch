import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import '../styles/Register.css';
import {removeSessionCookie, uploadFile, registerUser, tryLogin, deleteUser} from '../services/user';
import {Spinner} from '../modules/Spinner';

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
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
        removeSessionCookie();
        const userObject = {
            name: name,
            username: username,
            password: password,
            bio: bio,

        };


        registerUser(userObject)
            .then((success) => {

                if (profilePic) {
                    uploadFile(profilePic, success.user_id)
                        .then((success) => {
                            tryLogin(username, password)
                                .then((success) => {
                                    window.location.href = '/epoch/profile';
                                    setRegisteringPrompt('Register');
                                    setIsLoading(false);
                                })
                                .catch((error) => {
                                    setGeneralError(true);
                                    setRegisteringPrompt('Register');
                                    setIsLoading(false);

                                });

                        }).catch(() => {
                        deleteUser(success.user_id)
                            .then(() => {
                                setGeneralError(true);
                                setRegisteringPrompt('Register');
                                setIsLoading(false);

                            })
                            .catch(() => {
                                setGeneralError(true);
                                setRegisteringPrompt('Register');
                                setIsLoading(false);

                            });
                        setGeneralError(true);
                        setRegisteringPrompt('Register');
                        setIsLoading(false);

                    });
                } else {
                    tryLogin(username, password)
                        .then((success) => {
                            window.location.href = '/epoch/profile';
                            setRegisteringPrompt('Register');
                            setIsLoading(false);

                        })
                        .catch((error) => {
                            setGeneralError(true);
                            setRegisteringPrompt('Register');
                            setIsLoading(false);

                        });
                }

            })
            .catch((error) => {
                setGeneralError(error);
                setRegisteringPrompt('Register');
                setIsLoading(false);

            });
    };


    return (
        <div>
            {isLoading && <Spinner/>}
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

                        <div className="profile-pic-upload-container">

                            <div className="profile-pic-upload">
                                {profilePic ? (
                                    <img
                                        src={typeof profilePic === 'string' ? profilePic : URL.createObjectURL(profilePic)}
                                        alt="Profile Pic"/>
                                ) : (
                                    <img src={process.env.PUBLIC_URL + '/images/default_pfp.png'}
                                         alt="Default Profile Pic"/>
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
                        <textarea className="bio-textarea" id="bio" name="bio" value={bio}
                                  onChange={(e) => setBio(e.target.value)}/>

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
                            <span style={{
                                color: 'red',
                                marginLeft: '5px',
                                marginBottom: '5px'
                            }}>Could not register</span>}

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
        </div>
    );
}

export default Register;
