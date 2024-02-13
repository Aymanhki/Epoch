import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';

import Login from '../pages/login';
import Register from '../pages/register';
import Home from '../pages/home';
import Profile from '../pages/profile';

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/epoch/login" />} />
                <Route path="/epoch" element={<Navigate to="/epoch/login" />} />
                <Route path="/login" element={<Navigate to="/epoch/login" />} />
                <Route path="/register" element={<Navigate to="/epoch/register" />} />
                <Route path="/home" element={<Navigate to="/epoch/home" />} />
                <Route path="/:username" element={<ProfileRedirect />} />
                
                <Route path="/epoch/login" element={<Login />} />
                <Route path="/epoch/register" element={<Register />} />
                <Route path="/epoch/home" element={<Home />} />
                <Route path="/epoch/:username" element={<Profile />} />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<h1>404 Not Found</h1>} />
            </Routes>
        </BrowserRouter>
    );
}

function ProfileRedirect() {
    // Extract the username from the URL
    const { username } = useParams();

    // Redirect to /epoch/username
    return <Navigate to={`/epoch/${username}`} />;
}

export default Router;
