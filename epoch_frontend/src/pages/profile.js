import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
// need to distinguish if this is the current user logged in
    //should show edits if yes, show follow if not logged in
function Profile() {
    const { username } = useParams();
    var userInfo = getProfile(username);
    useEffect(() => {
        console.log(username);
    }, [username]);

    return (
        <div>
            <h1> {username} </h1>
        </div>
    );
}
//check if username is the username logged in.
function getProfile ( username ) {
    //search db
    
}
function ownProfile ( username) {
    //check logged in\
    //check if current session is the page being looked at
}
export default Profile;
