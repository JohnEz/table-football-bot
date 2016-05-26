'use strict';

import React from 'react';
import { Link } from 'react-router'

let PageNotFound = React.createClass({
	render() {
		return (
			<div className="content">
				<h2>Page Not Found.</h2>
        		<p>Go to <Link to="/">Home Page</Link></p>
			</div>

		);
	}
});

export default PageNotFound;
