'use strict';

import React from 'react';
import MatchDay from './matches/match-day.js';

var ResultTable = React.createClass({
	getInitialState: function() {
		return {
			results: []
		}
	},
	loadResultsFromServer: function() {
		fetch('/bot/results', {
			method: 'post',
		}).then(function(response) {
			return response.json()
		}).then(function(data) {
			this.setState({results: data});
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
					<h2>Results</h2>
				</div>

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
				</div>
			</div>
		);
	}
});

export default ResultTable;
