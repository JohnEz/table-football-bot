'use strict';

import React from 'react';
import {Link} from 'react-router'

var Header = React.createClass({

	render: function() {

		return (
			<div className="head">
				<div className="centre">
					<header>
						<h1>
							<span className="sl">Scott <span className="logic">Logic </span></span>
							Euro 2016 Foosball
						</h1>
					</header>
					<ul role="nav" className="nav">
						<li>
							<Link to="/group" activeClassName="active">Group Stage</Link>
						</li>
						/
						<li>
							<Link to="/knockout" activeClassName="active">Knockout Stage</Link>
						</li>
					</ul>
				</div>
			</div>

		);
	}
});

export default Header;
