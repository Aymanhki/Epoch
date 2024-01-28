import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Login from '../pages/login';
import Register from '../pages/register';
import Home from '../pages/home';
import Profile from '../pages/profile';

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </BrowserRouter>
    );
}

export default Router;