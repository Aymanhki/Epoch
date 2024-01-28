import React from 'react';
import '../styles/Login.css';

function Login() {
    return (
        <div className="login-container">
            <div className="login-form">

                <form>
                    <h2 style={{
                        fontSize: '32px',
                        marginBottom: '20px',
                        fontFamily: 'Futura',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        alignSelf: 'flex-start'
                    }}>
                        Login
                    </h2>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username"/>

                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password"/>

                    <button type="submit">Log In</button>

                    <p style={{textAlign: 'center', marginTop: '10px'}}>
                        Don't have an account? <span style={{textDecoration: 'underline'}}>Register here</span>.
                    </p>

                </form>
            </div>

            <div className="app-description">
                <div className="description-box">
                    <h2 style={{fontSize: '32px', marginBottom: '20px', fontFamily: 'Futura', fontWeight: 'bold' }}>
                        Epoch
                    </h2 >
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vulputate sapien porta justo tristique molestie. Nunc tortor leo, pellentesque sed sem a, commodo iaculis nibh. Quisque sed velit vel justo interdum tincidunt sit amet a quam. Integer nec quam vel nulla convallis feugiat. Sed semper sapien id lectus scelerisque, vitae placerat ligula tempor. Duis dapibus pharetra urna, vel mattis dui. Aenean augue neque, facilisis facilisis dictum eget, luctus in ante. Donec aliquam erat quis arcu malesuada facilisis. In hac habitasse platea dictumst. Aliquam finibus iaculis quam et auctor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nam non hendrerit elit.
                    </p>
                    <p>
                        Donec nec justo nisi. Nulla cursus dignissim lobortis. Nam eleifend dolor nulla, ut semper nisl placerat ut. Ut feugiat metus sed magna laoreet, vitae porttitor lorem rhoncus. Aenean semper molestie ante, et scelerisque lectus mattis tincidunt. Nunc imperdiet suscipit urna. Maecenas ullamcorper congue orci at consequat. Fusce ipsum ex, consectetur eget quam non, mollis elementum mi. Integer eros nisl, efficitur et quam ut, porttitor pellentesque tortor. Cras eu malesuada nunc, eget varius lorem. Ut semper at ante a consectetur. Vivamus finibus, enim ac dapibus sagittis, mauris felis maximus nisi, et condimentum ex est quis orci. Morbi quis sollicitudin nunc.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
