'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import Header from './components/header';
import GroupStage from './components/group-stage';

require('./styles.scss');

let App = React.createClass({
    render() {
        return (
            <div className='app'>
                <Header />
                <GroupStage />
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('app')
)
