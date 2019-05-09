import React from 'react';
import ReactDOM from 'react-dom';
import Index from './pages/Index';
import {
    BrowserRouter,
    Route,
} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import Login from './pages/Login';
import Playlist from './pages/Playlist';
import Register from './pages/Register';



ReactDOM.render(
    <BrowserRouter>
        <div>
            <Route exact path='/' component={Index} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/register' component={Register} />
            <Route exact path='/p/:id' component={Playlist} />

            {/* <Route path='/users' component={App} />  */}

        </div>
    </BrowserRouter>
    , document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
