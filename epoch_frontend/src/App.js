import Router from "./modules/Router";
import React from 'react';
import {UserProvider} from "./services/UserContext"

function App() {


    return (
        <UserProvider>
            <div className="App">
                <Router/>
            </div>
        </UserProvider>
    );
}

export default App;
