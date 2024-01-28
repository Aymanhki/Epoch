import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import '../styles/Login.css';
import {tryLogin, getUserInfo} from '../services/user'

function Login() {
    // State variables for username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginInPrompt, setLoginInPrompt] = useState('Checking existing session...')

    // State variables for field errors
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [generalError, setGeneralError] = useState(false);

    // State variable for redirect
    const [redirectToHome, setRedirectToHome] = useState(false);

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
            setLoginInPrompt('Logging In...');
            tryLogin(username, password)
                .then(success => {
                    window.location.href = "/home";
                    setLoginInPrompt('Log In');
                })
                .catch(error => {setGeneralError(true);})
        }
    };

    // Check for valid session cookie on component mount
    useEffect(() => {
        getUserInfo()
            .then(data => {setRedirectToHome(true);})
            .catch(error => {
                setRedirectToHome(false);
                setLoginInPrompt('Log In');
            });
    }, []);

    // Redirect to home if redirectToHome is true
    if (redirectToHome) {
        window.location.href = "/home";
        return <div><h2>User Signed In</h2></div>;
    }

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
                        {loginInPrompt}
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
                        <span style={{color: 'red', marginLeft: '5px'}}>Incorrect username or password</span>}

                    <button type="submit">{loginInPrompt}</button>

                    <p style={{textAlign: 'center', marginTop: '10px'}}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{textDecoration: 'underline', cursor: 'pointer', color: '#ffffff'}}>
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
                    <p>
                        Donec nec justo nisi. Nulla cursus dignissim lobortis. Nam eleifend dolor nulla, ut semper nisl
                        placerat ut. Ut feugiat metus sed magna laoreet, vitae porttitor lorem rhoncus. Aenean semper
                        molestie ante, et scelerisque lectus mattis tincidunt. Nunc imperdiet suscipit urna. Maecenas
                        ullamcorper congue orci at consequat. Fusce ipsum ex, consectetur eget quam non, mollis
                        elementum mi. Integer eros nisl, efficitur et quam ut, porttitor pellentesque tortor. Cras eu
                        malesuada nunc, eget varius lorem. Ut semper at ante a consectetur. Vivamus finibus, enim ac
                        dapibus sagittis, mauris felis maximus nisi, et condimentum ex est quis orci. Morbi quis
                        sollicitudin nunc.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
