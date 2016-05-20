'use strict';

import React from 'react';

var ToggleSwitch = React.createClass({
	render: function() {
		return (
			<div className="toggleSwitch">
				Groups:
				<label className="switch">
					<input
						className="slider round"
						type="checkbox"
						onChange={this.props.toggle}
						checked={this.props.grouped}
						/>
					<div className="slider round"></div>
				</label>
			</div>
		);
	}
});

export default ToggleSwitch;
