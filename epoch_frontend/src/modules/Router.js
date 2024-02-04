import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

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
                <Route path="/profile" element={<Navigate to="/epoch/profile" />} />
                <Route path="/epoch/login" element={<Login />} />
                <Route path="/epoch/register" element={<Register />} />
                <Route path="/epoch/home" element={<Home />} />
                <Route path="/epoch/profile" element={<Profile />} />
            </Routes>
        </BrowserRouter>
    );
}

export default Router;