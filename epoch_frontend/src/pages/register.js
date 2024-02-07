import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import '../styles/Register.css';
import {removeSessionCookie, uploadProfilePic, registerUser, tryLogin, deleteUser} from '../services/user';
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
    const [usernameErrorPrompt, setUsernameErrorPrompt] = useState('');
    const [passwordErrorPrompt, setPasswordErrorPrompt] = useState('');
    const [nameErrorPrompt, setNameErrorPrompt] = useState('');
    const [generalErrorPrompt, setGeneralErrorPrompt] = useState('');
    const fileInputRef = React.createRef();

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            setIsLoading(false);
            return;
        }

        setProfilePic(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let wrongUsername = false;
        let wrongPassword = false;
        let wrongName = false;


        if (!name.trim()) {
            setNameError(true);
            setNameErrorPrompt('Name field cannot be empty');
            wrongName = true;
        }

        if (!username.trim()) {
            setUsernameError(true);
            setUsernameErrorPrompt('Username field cannot be empty');
            wrongUsername = true;
        }

        if (!password.trim()) {
            setPasswordError(true);
            setPasswordErrorPrompt('Password field cannot be empty');
            wrongPassword = true;
        }


        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()-_+=|\\{}[\]:;<>,.?/~]).{8,254}$/;
        const usernameRegex = /^[a-zA-Z0-9_.@$-]{1,49}$/


        if(!password.match(passwordRegex)) {
            setPasswordError(true);
            setPasswordErrorPrompt('Password must be between 1 and 254 characters, at least one uppercase letter, one lowercase letter, one number, and one special character');
            wrongPassword = true;
        }
        else
        {
            setPasswordError(false);
            wrongPassword = false;
        }

        if(!username.match(usernameRegex)) {
            setUsernameError(true);
            setUsernameErrorPrompt('Username must be between 1 and 50 characters and can only contain letters, numbers, and the following special characters: . _ @ $ -');
            wrongUsername = true;
        }
        else
        {
            setUsernameError(false);
            wrongUsername = false;
        }

        if(name.length <= 0 || name.length > 255) {
            setNameError(true);
            setNameErrorPrompt('Name must be between 1 and 254 characters');
            wrongName = true;
        }
        else
        {
            setNameError(false);
            wrongName = false;
        }


        if (!wrongUsername && !wrongPassword && !wrongName) {

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
                        uploadProfilePic(profilePic, success.user_id)
                            .then((success) => {
                                tryLogin(username, password)
                                    .then((success) => {
                                        setIsLoading(false);
                                        window.location.href = '/epoch/profile';
                                        setRegisteringPrompt('Register');
                                    })
                                    .catch((error) => {
                                        setGeneralError(true);
                                        setRegisteringPrompt('Register');
                                        setIsLoading(false);
                                        setGeneralErrorPrompt(error);
                                    });

                            }).catch((error) => {
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
                                    setGeneralErrorPrompt('Could not register');

                                });

                            setGeneralError(true);
                            setRegisteringPrompt('Register');
                            setIsLoading(false);
                            setGeneralErrorPrompt(error);
                        });
                    } else {
                        tryLogin(username, password)
                            .then((success) => {
                                setRegisteringPrompt('Register');
                                setIsLoading(false);
                                window.location.href = '/epoch/profile';
                            })
                            .catch((error) => {
                                setGeneralError(true);
                                setIsLoading(false);
                                setGeneralErrorPrompt(error);
                                setRegisteringPrompt('Register');
                            });
                    }

                })
                .catch((error) => {
                    setGeneralError(true);
                    setIsLoading(false);
                    setGeneralErrorPrompt(error);
                    setRegisteringPrompt('Register');
                });
        }
    };

    return (
        <div>
            {isLoading ? <Spinner/> :
                <div className="register-container">
                <div className="register-form">
                    <form onSubmit={handleSubmit}>
                        <h1 style={{fontSize: '32px', marginBottom: '10px', fontFamily: 'Futura', fontWeight: 'bold', textAlign: 'left', alignSelf: 'flex-start'}}>{registeringPrompt}</h1>

                        <div className="profile-pic-upload-container" >

                            <div className="profile-pic-upload" >
                                {profilePic ? (
                                    <img
                                        src={typeof profilePic === 'string' ? profilePic : URL.createObjectURL(profilePic)}
                                        alt="Profile Pic"/>
                                ) : (
                                    <img src={process.env.PUBLIC_URL + '/images/default_pfp.png'}
                                         alt="Default Profile Pic"/>
                                )}
                            </div>

                            <div className="plus-sign" onClick={() => {fileInputRef.current.click(); }}>+</div>

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


                        <label htmlFor="name">Name {nameError && <span style={{color: 'red'}}>* {nameErrorPrompt}</span>}
                        </label>

                        <input type="text" id="name" name="name" value={name} onChange={(e) => {
                            setName(e.target.value);
                            setNameError(false);
                            setGeneralError(false);
                        }} />

                        <label htmlFor="bio">Bio</label>
                        <textarea className="bio-textarea" id="bio" name="bio" value={bio}
                                  onChange={(e) => setBio(e.target.value)}/>

                        <label htmlFor="username">Username {usernameError && <span style={{color: 'red'}}>* {usernameErrorPrompt}</span>}
                        </label>

                        <input type="text" id="username" name="username" value={username} onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError(false);
                            setGeneralError(false);
                        }} />

                        <label htmlFor="password">Password {passwordError && <span style={{color: 'red'}}>* {passwordErrorPrompt}</span>}
                        </label>

                        <input type="password" id="password" name="password" value={password} onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                            setGeneralError(false);
                        }} />

                        {generalError &&
                            <span style={{
                                color: 'red',
                                marginLeft: '5px',
                                marginBottom: '5px'
                            }}>{generalErrorPrompt}</span>}

                        <button type="submit" className={"register-button"}>{registeringPrompt}</button>

                        <p style={{textAlign: 'center', marginTop: '10px'}}>
                            Already have an account?{' '}
                            <Link
                                to="/epoch/login"
                                style={{
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                }}
                                className={"register-link"}
                            >
                                Log in here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
            }
        </div>
    );
}

export default Register;
