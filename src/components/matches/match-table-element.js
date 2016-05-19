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
				<div className="col winner country">{this.props.winner}</div>
				<div className="col score">{this.props.winnerScore}</div>
				<div className="col score">{this.props.loserScore}</div>
				<div className='col loser country'>{this.props.loser}</div>

			</div>
		);
	}
});

export default MatchTableElement;
