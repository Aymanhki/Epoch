import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import '../styles/Login.css';
import {tryLogin, getUserInfo} from '../services/user'
import {Spinner} from '../modules/Spinner'

function Login() {
    // State variables for username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signingInPrompt, setSigningInPrompt] = useState('Checking existing session...')
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


    // State variables for field errors
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [generalError, setGeneralError] = useState(false);

    const [generalErrorPrompt, setGeneralErrorPrompt] = useState('')
    const [usernameErrorPrompt, setUsernameErrorPrompt] = useState('')
    const [passwordErrorPrompt, setPasswordErrorPrompt] = useState('')


    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        let wrongUsername = false;
        let wrongPassword = false;

        // Validate fields
        if (!username.trim()) {
            setUsernameError(true);
            setUsernameErrorPrompt('Username field cannot be empty');
            wrongUsername = true;
        } else {
            setUsernameError(false);

        }

        if (!password.trim()) {
            setPasswordError(true);
            setPasswordErrorPrompt('Password field cannot be empty');
            wrongPassword = true;
        } else {
            setPasswordError(false);
        }


        if (!wrongUsername && !wrongPassword) {
            setIsLoading(true);
            setSigningInPrompt('Signing In...');
            tryLogin(username, password)
                .then(success => {
                    setIsLoading(false);
                    window.location.href = "/epoch/home";
                    setSigningInPrompt('Sign In');
                })
                .catch(error => {
                    setGeneralError(true);
                    setSigningInPrompt('Sign In');
                    setIsLoading(false);
                    setGeneralErrorPrompt(error);
                })

        }

        setIsLoading(false);

    };

    useEffect(() => {
        let isMounted = true;

        setIsLoading(true);
        getUserInfo()
            .then(data => {
                if (isMounted) {
                    console.log(data);
                    setSigningInPrompt('Sing In');
                    setIsLoading(false);
                    window.location.href = "/epoch/home";

                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error(error);
                    setSigningInPrompt('Sign in');
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [setIsLoading]);

      useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    return (
        <div>
            {isLoading ? <Spinner/> :
            <div className="login-container">

                {isMobile ? (
                <div className="login-form">
                    <form onSubmit={handleSubmit}>

                        <h2 style={{fontSize: '32px', marginBottom: '20px', fontFamily: 'Futura', fontWeight: 'bold', textAlign: 'left', alignSelf: 'flex-start'}}>
                            {signingInPrompt}
                        </h2>

                        <label htmlFor="username" className={"label-white"}>Username {usernameError &&
                            <span style={{color: 'red'}}>* {usernameErrorPrompt}</span>}
                        </label>

                        <input type="text" id="username" name="username" value={username} onChange={(e) => {setUsername(e.target.value);setUsernameError(false);setGeneralError(false);}}/>

                        <label htmlFor="password" className={"label-white"}>Password {passwordError &&
                            <span style={{color: 'red'}}>* {passwordErrorPrompt}</span>}
                        </label>

                        <input type="password" id="password" name="password" value={password} onChange={(e) => {setPassword(e.target.value);setPasswordError(false);setGeneralError(false);}} />

                        {generalError && <span style={{color: 'red', marginLeft: '5px', marginBottom: '5px'}}>{generalErrorPrompt}</span>}

                        <button type="submit">{signingInPrompt}</button>

                        <p style={{textAlign: 'center', marginTop: '10px'}}>
                            Don't have an account?{' '}
                            <Link to="/epoch/register" style={{textDecoration: 'underline', cursor: 'pointer', color: '#ffffff'}}>
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
                    ) : (
                    <>
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

                                <label htmlFor="username" className={"label-white"}>Username {usernameError &&
                                    <span style={{color: 'red'}}>* {usernameErrorPrompt}</span>}
                                </label>

                                <input type="text" id="username" name="username" value={username} onChange={(e) => {
                                    setUsername(e.target.value);
                                    setUsernameError(false);
                                    setGeneralError(false);
                                }} />

                                <label htmlFor="password" className={"label-white"}>Password {passwordError &&
                                    <span style={{color: 'red'}}>* {passwordErrorPrompt}</span>}
                                </label>

                                <input type="password" id="password" name="password" value={password} onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError(false);
                                    setGeneralError(false);
                                }} />

                                {generalError && <span style={{color: 'red', marginLeft: '5px', marginBottom: '5px'}}>{generalErrorPrompt}</span>}

                                <button type="submit">{signingInPrompt}</button>

                                <p style={{textAlign: 'center', marginTop: '10px'}}>
                                    Don't have an account?{' '}
                                    <Link to="/epoch/register"
                                          style={{textDecoration: 'underline', cursor: 'pointer', color: '#ffffff'}}>
                                        Register here
                                    </Link>
                                </p>
                            </form>
                        </div>
                        <div className="app-description">
                            <div className="description-box">
                                <h2 style={{
                                    fontSize: '32px',
                                    marginBottom: '20px',
                                    fontFamily: 'Futura',
                                    fontWeight: 'bold'
                                }}>
                                    Epoch
                                </h2>
                                <p>
                                    Epoch is a social media platform for time capsules. Write down your thoughts,
                                    feelings, and predictions, and send them to the future. You can also read other
                                    people's capsules and vote them up or down depending on the accuracy or likeability
                                    of the time capsule or prediction. Create your network of followers, explore popular
                                    hashtags, and comment and share your favorite capsules. Save your favorite capsules
                                    to your profile and keep track of your own capsules and the capsules you've
                                    interacted with. Epoch is a place to share your thoughts and predictions with the
                                    world and to see what others have to say about the future.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            }
        </div>
    );
}

export default Login;
