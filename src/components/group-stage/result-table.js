'use strict';

import React from 'react';
import MatchDay from '../matches/match-day.js';
import classnames from 'classnames';

var ResultTable = React.createClass({
	getInitialState: function() {
		return {
			results: [],
			loaded: false,
			moreCount: 1,
			atLimit: true
		}
	},
	loadResultsFromServer: function() {
		let count = this.state.moreCount;
		fetch(`http://localhost:53167/api/results/table/${count}`)
		.then(function(response) {
			return response.json()
		}).then(function(data) {
			this.setState({results: data.results, loaded: true, moreCount: this.state.moreCount + 1, atLimit: data.atLimit});
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

			let footClass = classnames({
				"load-more": true,
				"hidden": this.state.atLimit
			});

			let body = "";
			if (this.state.results.length === 0) {
				body = <div className="no-results" >There are currently no results to show.</div>
			}

			return (
				<div className='results'>
					<div className='section-header'>
						<h2>Results</h2>
					</div>
					{body}
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
						<div className={footClass}
							onClick={this.loadResultsFromServer} >
							Load More
						</div>
					</div>
				</div>
			);
		}
	});

	export default ResultTable;
