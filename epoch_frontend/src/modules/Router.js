import React from 'react';
import {BrowserRouter, Route, Routes, Navigate, useParams} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/login';
import Register from '../pages/register';
import Home from '../pages/home';
import Profile from '../pages/profile';
import Userlist from '../pages/userlist';
import {NotFound} from "../pages/notFound";
import Hashtag from "../pages/Hashtag";
import Favorites from "../pages/Favorites";
import Comments from "../pages/Comments";

function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/epoch/login"/>}/>
                <Route path="/epoch" element={<Navigate to="/epoch/login"/>}/>
                <Route path="/login" element={<Navigate to="/epoch/login"/>}/>
                <Route path="/register" element={<Navigate to="/epoch/register"/>}/>
                <Route path="/home" element={<Navigate to="/epoch/home"/>}/>
                <Route path="/userlist" element={<Navigate to="/epoch/userlist"/>}/>
                <Route path="/search" element={<Navigate to="/epoch/search"/>}/>
                <Route path="/favorites" element={<Navigate to="/epoch/favorites"/>}/>

                <Route path="/hashtags/:hashtag" element={<Hashtag />} />
                <Route path="/epoch/hashtags/:hashtag" element={<Hashtag />} />
                <Route path="/epoch/comments/:post-id" element={<Comments />} />

                <Route path="/epoch/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/epoch/login" element={<Login />} />
                <Route path="/epoch/register" element={<Register />} />
                <Route path="/epoch/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/epoch/:username" element={<ProtectedRoute><ProfileRedirect /></ProtectedRoute>} />
                <Route path="/epoch/userlist" element={<ProtectedRoute><Userlist /></ProtectedRoute>} />
                <Route path="/epoch/search" element={<ProtectedRoute><Userlist /></ProtectedRoute>} />
                <Route path="/:username" element={<ProtectedRoute><ProfileRedirect /></ProtectedRoute>} />
                

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}

function ProfileRedirect() {
    const {username} = useParams();

    if (username.includes("hashtags") || username.includes("#")) {
        return <Hashtag/>;
    } 
    else if (username.includes("comments")){
        return <Comments/>
    }
    else
    {
        return <Profile />;
    }
}

export default Router;