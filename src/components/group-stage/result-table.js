'use strict';

import React from 'react';
import MatchDay from '../matches/match-day.js';

var ResultTable = React.createClass({
	getInitialState: function() {
		return {
			results: [],
			loaded: false,
			moreCount: 1
		}
	},
	loadResultsFromServer: function() {
		let count = this.state.moreCount;
		fetch('/bot/results', {
			method: 'POST',
			headers: {
	          'Accept': 'application/json',
	          'Content-Type': 'application/json'
	        },
			body: JSON.stringify({count: count})
		}).then(function(response) {
			return response.json()
		}).then(function(data) {
			this.setState({results: data, loaded: true, moreCount: this.state.moreCount + 1});
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
				<div className='results'>
					<div className='section-header'>
						<h2>Results</h2>
					</div>
					<div className="section-body">
						<div className="table">
							{
								this.state.results.map(function(day) {
									return (
										<MatchDay
											key={`result-${day.date}`}
											day = {day.date}
											results = {day.results}
											/>
									);
								})
							}
							{spinner}
						</div>
					</div>
					<div className="section-footer">
						<div onClick={this.loadResultsFromServer} >&bull; &bull; &bull;</div>
					</div>
				</div>
			);
		}
	});

	export default ResultTable;
