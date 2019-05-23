import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            loggedIn: 12
        };
        setTimeout(() => {
            console.log("test");
            this.setState({
                loggedIn: 13
            })
        }, 2000);

    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <p>
                        Edit <code>src/Haha.js</code> and save to reload.
                    </p>
                    <a
                        className="App-link"
                        href="https://dupa.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn React
                        {this.state.loggedIn}
                    </a>
                </header>
            </div>
        );
    }

}

