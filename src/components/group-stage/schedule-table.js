'use strict';

import React from 'react';
import MatchDay from '../matches/match-day.js';
import MatchTableElement from '../matches/match-table-element.js'

var ScheduleTable = React.createClass({
	getInitialState: function() {
		return {
			today: [],
			overdue: [],
			upcoming: [],
			loaded: false,
			moreCount: 1,
		}
	},
	loadResultsFromServer: function() {
		fetch('/bot/schedule', {
			method: 'post',
		}).then(function(response) {
			return response.json()
		}).then(function(data) {
			this.setState({today: data.today, overdue: data.overdue, loaded: true});
		}.bind(this)).catch(function(ex) {
			console.log('json parse failed', ex);
		});
	},
	loadUpcomingResultsFromServer: function() {
		let count = this.state.moreCount;
		fetch('/bot/future', {
			method: 'post',
			headers: {
	          'Accept': 'application/json',
	          'Content-Type': 'application/json'
	        },
			body: JSON.stringify({count: count})
		}).then(function(response) {
			return response.json()
		}).then(function(data) {
			this.setState({upcoming: data, moreCount: this.state.moreCount+1});
		}.bind(this)).catch(function(ex) {
			console.log('json parse failed', ex);
		});
	},
	componentDidMount: function() {
		this.loadResultsFromServer();
	},
	render: function() {
		let spinner = null;

		if (!this.state.loaded) {
			spinner = <div className="loader">Loading...</div>;
		}

		return (
			<div className='schedule'>
				<div className='section-header'>
					<h2>Schedule</h2>
				</div>
				<div className="section-body">

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
						{spinner}
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
						{spinner}
					</div>

					<div className="table">
							{
								this.state.upcoming.map(function(day) {
									return (
										<MatchDay
											key={`result-${day.date}`}
											day = {day.date}
											results = {day.matches}
											/>
									);
								})
							}
					</div>

				</div>
				<div className="section-footer">
					<div className="load-more"
						onClick={this.loadUpcomingResultsFromServer} >
						&bull; &bull; &bull;
					</div>
				</div>

			</div>
		);
	}

});

export default ScheduleTable;
