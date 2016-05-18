'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import UserTable from './components/user-table';
import ResultTable from './components/result-table';

let App = React.createClass({
    render() {
        return (
            <div className='app'>
                <h1>Scott Logic Table Football Bot</h1>
                <p>Welcome to the Thunderdome</p>
                <UserTable />
                <ResultTable />
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('app')
)
