'use strict';

import React from 'react';
import { Link } from 'react-router'

import Header from './header';

let App = React.createClass({
	render() {
		return (
			<div className='app'>
				<Header />			
                {this.props.children}
			</div>
		);
	}
});

export default App;
