import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Utility function to get the "epoch_session_id" cookie
export function getSessionCookie() {
    return document.cookie.split('; ').find(row => row.startsWith('epoch_session_id='));
}

// Utility function to check if the session is active based on the "epoch_session_id" cookie
export function isSessionActive() {
    return !!getSessionCookie();
}

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the session is active; if not, redirect to the login page
        if (!isSessionActive()) {
            navigate('/epoch/login');
        }
    }, [navigate]);

    // Render the children if the session is active
    return children;
};

export default ProtectedRoute;
