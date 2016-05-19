'use strict';

import React from 'react';
import classnames from 'classnames';
import UserTableElement from './user-table-element.js';
import TableGroupHeader from './table-group-header.js';
import ToggleSwitch from './toggle-switch.js';

var UserTable = React.createClass({
	getInitialState: function() {
		return {
			users: [],
			grouped: true
		}
	},
	handleGroupToggle: function() {
		this.setState({grouped: !this.state.grouped})
	},
	loadTableFromServer: function() {
		fetch('/bot/users', {
			method: 'get',
		}).then(function(response) {
			return response.json()
		}).then(function(data) {
			data.sort(function(a,b) {
				let win = b.won - a.won;
				if(win) return win;
				let scored = b.for - a.for;
				if(scored) return scored;
				return b.against - a.against;
			});
			this.setState({users: data});
		}.bind(this)).catch(function(ex) {
			console.log('json parse failed', ex);
		});
	},
	componentDidMount: function() {
		this.loadTableFromServer();
	},
	render: function() {
		let groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
		let users = this.state.users;
		return (
			<div className="table">
				<ToggleSwitch
				 	toggle = {this.handleGroupToggle}
					grouped = {this.state.grouped}
					/>
				<h2>User Tables</h2>
				<UserTableElement
					rowType = 'header'
					country = 'Country'
					slack = 'Slack ID'
					won = 'W'
					lost = 'L'
					scored = 'F'
					against = 'A'

				/>
				{groups.map(function(group) {
					return (
						<TableGroupHeader
							key={`group ${group}`}
						 	group = {group}
							grouped = {this.state.grouped}
							/>
					)
				}.bind(this))}
				{users.map(function(user) {
					return (
						<UserTableElement
							key={user.id}
							rowType = 'body'
							country = {user.country}
							slack = {'@' + user.slackId}
							won = {user.won}
							lost = {user.lost}
							scored = {user.for}
							against = {user.against}
							group = {user.group}
							grouped = {this.state.grouped}
						/>
					)
				}.bind(this))}

			</div>
		)
	}

});

export default UserTable;
