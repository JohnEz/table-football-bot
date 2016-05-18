'use strict';

import React from 'react';

var UserTable = React.createClass({
	getInitialState: function() {
		return {
			users: []
		}
	},
	loadResultsFromServer: function() {
		fetch('/bot/users', {
			method: 'get',
		}).then(function(response) {
			return response.json()
		}).then(function(data) {
			this.setState({users: data});
		}.bind(this)).catch(function(ex) {
			console.log('json parse failed', ex);
		});
	},
	componentDidMount: function() {
		this.loadResultsFromServer();
		// IDEA Poll for updates?
		//setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	render: function() {
		console.log(this.state.users);
		var rows = [];
		if(this.state.users.length > 0 ) {
			this.state.users.forEach(function(user) {
				rows.push(
					<tr key={user._id}>
						<td>{user.country}</td>
						<td>@{user.slackID}</td>
					</tr>
				)
			});
		}
		return (
			<div className='results'>
				<h2>Results</h2>
				<table>
					<thead>
						<tr>
							<th>Country</th>
							<th>Slack ID</th>
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

export default UserTable;
