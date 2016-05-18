'use strict';

import React from 'react';

var Table = React.createClass({
	getInitialState: function() {
		return {
			results: []
		}
	},
	render: function() {
		var rows = [];

		this.props.users.forEach(function(user) {
			rows.push(
				<tr key={user.id}>
					<td>{user.country}</td>
					<td>@{user.slackId}</td>
					<td>{user.won}</td>
					<td>{user.lost}</td>
					<td>{user.for}</td>
					<td>{user.against}</td>
				</tr>
			)
		});

		return (
			<div className='results group'>
				<h3>{this.props.group}</h3>
				<table>
					<thead>
						<tr>
							<th>Country</th>
							<th>Slack ID</th>
							<th>Won</th>
							<th>Lost</th>
							<th>Goals for</th>
							<th>Goals against</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	}
});

export default Table;
