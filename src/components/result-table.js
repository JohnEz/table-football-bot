'use strict';

import React from 'react';

var ResultTable = React.createClass({
	getInitialState: function() {
		return {
			results: []
		}
	},
	loadResultsFromServer: function() {
		fetch('/bot/results', {
			method: 'get',
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
		var rows = [];
		if(this.state.results.length > 0 ) {
			this.state.results.forEach(function(result) {
				rows.push(
					<tr key={result.id}>
						<td>{result.winner}</td>
						<td>{result.winScore}</td>
						<td>{result.loseScore}</td>
						<td>{result.loser}</td>
					</tr>
				)
			});
		}
		return (
			<div className='results'>
				<h2>Results</h2>
				<table>
					<thead>
						<tr>
							<th>Winner</th>
							<th></th>
							<th></th>
							<th>Loser</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>


			</div>
		);
	}
});

export default ResultTable;
