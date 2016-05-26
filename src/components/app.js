'use strict';

import React from 'react';
import { Link } from 'react-router'

import Header from './header';

let App = React.createClass({
	render() {
		return (
			<div className='wrapper'>
				<Header />
				<div className='app'>
					<div className="fade leftFade"></div>
					<div className="container centre">
						{this.props.children}
					</div>
					<div className="fade rightFade"></div>
				</div>
			</div>
		);
	}
});

export default App;
