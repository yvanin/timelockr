import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Event from './Event';
import Confirmation from './Confirmation';

const API = "https://qluk5urb48.execute-api.us-east-2.amazonaws.com/Prod/api"

const _Event = () => <Event api={API} />
const _Confirmation = () => <Confirmation api={API} eventId={(new URL(document.location)).searchParams.get("eventId")} />

/**
 * Root component
 */
const App = () => (
    <Router>
        <div id="app">
            <nav className="navbar navbar-inverse navbar-fixed-top">
                <div className="container">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="/">Timelockr</a>
                    </div>
                </div>
            </nav>
            <Route exact path="/" component={_Event} />
            <Route path="/confirm" component={_Confirmation} />
            <footer />
        </div>
    </Router>
)

export default App  