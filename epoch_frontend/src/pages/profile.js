import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
// need to distinguish if this is the current user logged in
    //should show edits if yes, show follow if not logged in
function Profile() {
    const { username } = useParams();

    useEffect(() => {
        console.log(username);
    }, [username]);

    return (
        <div>
            <h1>User Profile</h1>
        </div>
    );
}

export default Profile;
