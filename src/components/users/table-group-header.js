'use strict';

import React from 'react';
import classnames from 'classnames';

var TableGroupHeader = React.createClass({
	render: function() {
		let name = classnames({
			'table-row': true,
			'table-group-header': true,
			[`${this.props.group.toLowerCase()}`]: true,
			'hidden': !this.props.grouped
		})
		return (
			<div className={name} >
				Group {this.props.group}
			</div>
		);
	}
});

export default TableGroupHeader;
