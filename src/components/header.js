'use strict';

import React from 'react';
import {Link} from 'react-router'

var Header = React.createClass({

	render: function() {

		return (
			<div className="head">
				<div className="centre header">
					<header>
							<img className="sl" alt="Scott-Logic" src={require("../img/scott-logic.png")} />
							<img className="sl" alt="Euro 2016" src={require("../img/euro2016.png")} />
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
