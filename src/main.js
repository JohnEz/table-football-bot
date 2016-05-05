'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

let App = React.createClass({
  render() {
    return (
      <div className='app'>
        <h1>Scott Logic Table Football Bot</h1>
        <p>Welcome to the Thunderdome</p>
      </div>
    );
  }
});

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
