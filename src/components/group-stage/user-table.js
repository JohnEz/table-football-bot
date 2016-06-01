'use strict';

import React from 'react';
import classnames from 'classnames';
import UserTableElement from '../users/user-table-element.js';
import TableGroupHeader from '../users/table-group-header.js';
import ToggleSwitch from '../users/toggle-switch.js';

var UserTable = React.createClass({
	getInitialState: function() {
		return {
			users: [],
			grouped: false,
			loaded: false
		}
	},
	handleGroupToggle: function() {
		this.setState({grouped: !this.state.grouped})
	},
	loadTableFromServer: function() {
		fetch('/bot/users', {
			method: 'post',
		}).then(function(response) {
			return response.json()
		}).then(function(data) {
			data.sort(function(a,b) {
				let diff = (b.won*3 + b.draw) - (a.won*3 + a.draw);
				if(diff === 0) {
					diff = b.won - a.won;
					if (diff === 0) {
						diff = (b.for-b.against) - (a.for-a.against);
					}
				}
				return diff;
			});
			this.setState({users: data, loaded: true});
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
		let spinner = null;

		if (!this.state.loaded) {
			spinner = <div className="loader">Loading...</div>;
		}

		return (
			<div className="user-leagues">
				<div className="section-header">
					<h2>League Tables</h2>
					<ToggleSwitch
						toggle = {this.handleGroupToggle}
						grouped = {this.state.grouped}
						/>
				</div>
				<div className="section-body">
				<div className='table'>
					<UserTableElement
						rowType = 'header'
						country = 'Country'
						slack = 'Slack ID'
						won = 'W'
						draw = 'D'
						lost = 'L'
						scored = 'F'
						against = 'A'
						diff = 'GD'
						points = 'Pts'

						/>
					<div className="table-content">
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
									key={user._id}
									rowType = 'body'
									country = {user.country}
									slack = {'@' + user.slackID}
									won = {user.won}
									draw = {user.draw}
									lost = {user.lost}
									scored = {user.for}
									against = {user.against}
									diff = {user.for - user.against}
									points = {user.won*3 + user.draw}
									group = {user.group}
									grouped = {this.state.grouped}
									/>
							)
						}.bind(this))}
					</div>
					{spinner}
					</div>
				</div>
				
			</div>
		)
	}

});

export default UserTable;
