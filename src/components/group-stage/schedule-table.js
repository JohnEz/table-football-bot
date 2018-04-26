'use strict';

import React from 'react';
import MatchDay from '../matches/match-day.js';
import MatchTableElement from '../matches/match-table-element.js';
import classnames from 'classnames';

var ScheduleTable = React.createClass({
	getInitialState: function() {
		return {
			today: [],
			overdue: [],
			upcoming: [],
			loaded: false,
			moreCount: 1,
			atLimit: true
		}
	},
	loadGamesFromServer: function() {
		fetch('http://localhost:53167/api/matches/schedule')
		.then(function(response) {
			return response.json();
		}).then(function(data) {
			if(data.message) {
				console.error(data.message);
			}
			this.setState({today: data.today, overdue: data.overdue, loaded: true, atLimit: data.atLimit });
			if (this.state.today.length + this.state.overdue.length < 8) {
				this.loadUpcomingGamesFromServer();
			}
		}.bind(this)).catch(function(ex) {
			console.log('json parse failed', ex);
		});
	},
	loadUpcomingGamesFromServer: function() {
		let count = this.state.moreCount;
		fetch(`http://localhost:53167/api/matches/upcoming/${count}`)
		.then(function(response) {
			return response.json()
		}).then(function(data) {
			this.setState({upcoming: data.upcoming, moreCount: this.state.moreCount+1, atLimit: data.atLimit });
		}.bind(this)).catch(function(ex) {
			console.log('json parse failed', ex);
		});
	},
	componentDidMount: function() {
		this.loadGamesFromServer();
	},
	render: function() {
		let spinner = null;

		if (!this.state.loaded) {
			spinner = <div className="loader">Loading...</div>;
		}

		let footClass = classnames({
			"load-more": true,
			"hidden": this.state.atLimit
		});

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
					<div className={footClass}
						onClick={this.loadUpcomingGamesFromServer} >
						Load More
					</div>
				</div>

			</div>
		);
	}

});

export default ScheduleTable;
