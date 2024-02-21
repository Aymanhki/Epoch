import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';

import Login from '../pages/login';
import Register from '../pages/register';
import Home from '../pages/home';
import Profile from '../pages/profile';
import Userlist from '../pages/userlist';
import {NotFound} from "../pages/notFound";

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
                <Route path="/epoch/userlist" element={<Userlist/>} />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

function ProfileRedirect() {
    const { username } = useParams();
    return <Navigate to={`/epoch/${username}`} />;
}

export default Router;
