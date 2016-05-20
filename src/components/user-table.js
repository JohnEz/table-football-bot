'use strict';

import React from 'react';
import classnames from 'classnames';
import UserTableElement from './users/user-table-element.js';
import TableGroupHeader from './users/table-group-header.js';
import ToggleSwitch from './users/toggle-switch.js';

var UserTable = React.createClass({
	getInitialState: function() {
		return {
			users: [],
			grouped: false
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
				let diff = b.won - a.won;
				if(diff === 0) {
					diff = b.for - a.for;
					if (diff === 0) {
						diff = b.against - a.against;
					}
				}
				return diff;
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
			<div className="user-leagues">
				<div className="section-header">
					<h2>League Tables</h2>
					<ToggleSwitch
						toggle = {this.handleGroupToggle}
						grouped = {this.state.grouped}
						/>
				</div>
				<div className='table'>
					<UserTableElement
						rowType = 'header'
						country = 'Country'
						slack = 'Slack ID'
						won = 'W'
						lost = 'L'
						scored = 'F'
						against = 'A'

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
					</div>

			</div>
		)
	}

});

export default UserTable;
