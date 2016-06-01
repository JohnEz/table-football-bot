'use strict';

import React from 'react';
import classnames from 'classnames';

var MatchTableElement = React.createClass({
	render: function() {
		let rowClass = classnames({
			'table-row': true,
			'table-body': true
		});
		return (
			<div className={rowClass}>
				<div className="col winner country">{this.props.p1}</div>
				<div className="col score">{this.props.p1Score}</div>
				<div className="col score">{this.props.p2Score}</div>
				<div className='col loser country'>{this.props.p2}</div>

			</div>
		);
	}
});

export default MatchTableElement;
