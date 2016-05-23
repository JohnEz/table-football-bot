'use strict';

import React from 'react';
import classnames from 'classnames';

var UserTableElement = React.createClass({
	render: function() {
		let rowClass = classnames({
			'table-row': true,
			[`table-${this.props.rowType}`]: true,
			[`${this.props.group}`]: this.props.group,
			'consolidated': !this.props.grouped
		});
		return (
			<div className={rowClass}>
				<div className="col country">{this.props.country}</div>
				<div className="col slack">{this.props.slack}</div>
				<div className="col won">{this.props.won}</div>
				<div className="col draw">{this.props.draw}</div>
				<div className='col lost'>{this.props.lost}</div>
				<div className="col for">{this.props.scored}</div>
				<div className="col against">{this.props.against}</div>
				<div className="col diff">{this.props.diff}</div>
				<div className="col points">{this.props.points}</div>
			</div>
		);
	}
});

export default UserTableElement;
