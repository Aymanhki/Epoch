// Use browser router to wrap the app

import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import login from '../pages/login';
import register from '../pages/register';
import home from '../pages/home';
import profile from '../pages/profile';

function Router() {
    return (
        <BrowserRouter>
            <Route path="/" eexact component={login} />
            <Route path="/login" exact component={login} />
            <Route path="/register" exact component={register} />
            <Route path="/home" exact component={home} />
            <Route path="/profile" exact component={profile} />
        </BrowserRouter>
    );
}

export default Router;