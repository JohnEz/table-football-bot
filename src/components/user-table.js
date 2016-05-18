'use strict';

import React from 'react';
import Table from './table.js';

var UserTable = React.createClass({
	getInitialState: function() {
		return {
			users: []
		}
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
		return (
			<div>
				<h2>User Tables</h2>
				<Table
					group='All'
					users={this.state.users}
					/>
			</div>
		)
	}

});

export default UserTable;
