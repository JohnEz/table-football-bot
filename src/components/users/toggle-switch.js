'use strict';

import React from 'react';

var ToggleSwitch = React.createClass({
	render: function() {
		return (
			<div className="toggleSwitch">
				<label>Separate Groups
					<input
						className="switch-input"
						type="checkbox"
						onChange={this.props.toggle}
						checked={this.props.grouped}
						/>
				</label>
			</div>
		);
	}
});

export default ToggleSwitch;
