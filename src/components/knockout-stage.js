'use strict';

import React from 'react';
import BracketColumn from './knockout-stage/bracket-column.js';
import WinnerColumn from './knockout-stage/winner-column.js';

let KnockoutStage = React.createClass({
	getInitialState: function() {
		return {
			matches: {},
			loaded: false
		}
	},
	loadResultsFromServer: function() {
		fetch('/bot/brackets', {
			method: 'post',
		}).then(function(response) {
			return response.json()
		}).then(function(data) {
			this.setState({matches: data, loaded: true});
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

		let columns = [];

		if (this.state.matches.prelims) {
			columns.push(<BracketColumn key={this.state.matches.prelims.length} matches={this.state.matches.prelims} date="25-27TH JUNE"/>);
			columns.push(<BracketColumn key={this.state.matches.quaterFinals.length} matches={this.state.matches.quaterFinals} date="30-3RD JULY"/>);
			columns.push(<BracketColumn key={this.state.matches.semiFinals.length} matches={this.state.matches.semiFinals} date="6-7TH JULY"/>);
			columns.push(<BracketColumn key={this.state.matches.finals.length} matches={this.state.matches.finals} date="10TH JULY"/>);
			columns.push(<WinnerColumn key ='winnerColumn' winner='Winner'/>);
		}

		return (
			<div className="content">
				<div className="bracket">
					{columns}
					{spinner}
				</div>
			</div>

		);
	}
});

export default KnockoutStage;
