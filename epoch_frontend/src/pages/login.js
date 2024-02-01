import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import '../styles/Login.css';
import {tryLogin, getUserInfo} from '../services/user'

function Login() {
    // State variables for username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signingInPrompt, setSigningInPrompt] = useState('Checking existing session...')

    // State variables for field errors
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [generalError, setGeneralError] = useState(false);


    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate fields
        if (!username.trim()) {
            setUsernameError(true);
        } else {
            setUsernameError(false);
        }

        if (!password.trim()) {
            setPasswordError(true);
        } else {
            setPasswordError(false);
        }

        // If both fields are filled, perform login action
        if (username && password) {
            setSigningInPrompt('Logging In...');
            tryLogin(username, password)
                .then(success => {
                    window.location.href = "/epoch/home";
                    setSigningInPrompt('Ok');
                })
                .catch(error => {
                    setGeneralError(true);
                    setSigningInPrompt('Log In');
                })
        }
    };

    useEffect(() => {
        let isMounted = true;

        getUserInfo()
            .then(data => {
                if (isMounted) {
                    console.log(data);
                    setSigningInPrompt('Ok');
                    window.location.href = "/epoch/home";
                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error(error);
                    setSigningInPrompt('Log In');
                }
            });

        // Cleanup function to handle component unmounting
        return () => {
            isMounted = false;
        };
    }, []);


    return (
        <div className="login-container">
            <div className="login-form">
                <form onSubmit={handleSubmit}>

                    <h2 style={{
                        fontSize: '32px',
                        marginBottom: '20px',
                        fontFamily: 'Futura',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        alignSelf: 'flex-start'
                    }}>
                        {signingInPrompt}
                    </h2>

                    <label htmlFor="username">Username {usernameError && <span style={{color: 'red'}}>*</span>}
                        {usernameError && !username.trim() &&
                            <span style={{color: 'red', marginLeft: '5px'}}>Username field cannot be empty</span>}
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
                            <span style={{color: 'red', marginLeft: '5px'}}>Password field cannot be empty</span>}
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
                        <span style={{color: 'red', marginLeft: '5px', marginBottom: '5px'}}>Incorrect username or password</span>}

                    <button type="submit">{signingInPrompt}</button>

                    <p style={{textAlign: 'center', marginTop: '10px'}}>
                        Don't have an account?{' '}
                        <Link to="/epoch/register" style={{textDecoration: 'underline', cursor: 'pointer', color: '#ffffff'}}>
                            Register here
                        </Link>
                    </p>

                </form>
            </div>

            <div className="app-description">
                <div className="description-box">
                    <h2 style={{fontSize: '32px', marginBottom: '20px', fontFamily: 'Futura', fontWeight: 'bold'}}>
                        Epoch
                    </h2>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vulputate sapien porta justo
                        tristique molestie. Nunc tortor leo, pellentesque sed sem a, commodo iaculis nibh. Quisque sed
                        velit vel justo interdum tincidunt sit amet a quam. Integer nec quam vel nulla convallis
                        feugiat. Sed semper sapien id lectus scelerisque, vitae placerat ligula tempor. Duis dapibus
                        pharetra urna, vel mattis dui. Aenean augue neque, facilisis facilisis dictum eget, luctus in
                        ante. Donec aliquam erat quis arcu malesuada facilisis. In hac habitasse platea dictumst.
                        Aliquam finibus iaculis quam et auctor. Pellentesque habitant morbi tristique senectus et netus
                        et malesuada fames ac turpis egestas. Nam non hendrerit elit.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
