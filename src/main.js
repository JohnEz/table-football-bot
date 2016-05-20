'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import Header from './components/header';
import UserTable from './components/user-table';
import ResultTable from './components/result-table';
import ScheduleTable from './components/schedule-table';

require('./styles.scss');

let App = React.createClass({
    render() {
        return (
            <div className='app'>
                <Header />

                <div className="content">
                    <section className="col-left">
                        <ScheduleTable />
                        <ResultTable />
                    </section>
                    <section className="col-right">
                        <UserTable />

                    </section>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('app')
)
