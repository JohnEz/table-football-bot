'use strict';

import React from 'react';
import MatchTableElement from './matches/match-table-element.js'

var ScheduleTable = React.createClass({
	getInitialState: function() {
		return {
			today: [],
			overdue: []
		}
	},
	loadResultsFromServer: function() {
		fetch('/bot/schedule', {
			method: 'get',
		}).then(function(response) {
			return response.json()
		}).then(function(data) {
			this.setState({today: data.today, overdue: data.overdue, upcoming: data.upcoming});
		}.bind(this)).catch(function(ex) {
			console.log('json parse failed', ex);
		});
	},
	componentDidMount: function() {
		this.loadResultsFromServer();
	},
	render: function() {

		return (
			<div className='results'>
				<div className='section-header'>
					<h2>Schedule</h2>
				</div>

				<div className="table">
					<div className='table-row table-date'>Today's Games</div>
					{
						this.state.today.map(function(match) {
							return (
								<MatchTableElement
									key={match._id}
									p1 = {match.team1.country}
									p2 = {match.team2.country}
									p1Score = 'vs'
									/>
							);
						})
					}
				</div>

				<div className="table">
					<div className='table-row table-date'>Overdue Games</div>
					{
						this.state.overdue.map(function(match) {
							return (
								<MatchTableElement
									key={match._id}
									p1 = {match.team1.country}
									p2 = {match.team2.country}
									p1Score = 'vs'
									/>
							);
						})
					}
				</div>

			</div>
		);
	}

});

export default ScheduleTable;
