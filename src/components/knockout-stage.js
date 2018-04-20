'use strict';

import React from 'react';
import BracketColumn from './knockout-stage/bracket-column.js';
import WinnerColumn from './knockout-stage/winner-column.js';

let KnockoutStage = React.createClass({
	getInitialState: function() {
		return {
			matches: {},
			loaded: false,
			highlightedTeam: ''
		}
	},
	loadResultsFromServer: function() {
		fetch('http://localhost:53167/api/matches/knockouts')
		.then(function(response) {
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
		let self = this;
		let highlightedTeam = this.state.highlightedTeam;

		let highlightFunction = function(player) {
			if (player._id) {
				self.setState({highlightedTeam: player.country});
			} else {
				self.setState({highlightedTeam: ''});
			}
		}

		if (!this.state.loaded) {
			spinner = <div className="loader">Loading...</div>;
		}

		let columns = [];

		if (this.state.matches.prelims) {
			columns.push(<BracketColumn
				key={this.state.matches.prelims.length}
				matches={this.state.matches.prelims}
				date="25-27TH JUNE"
				highlightedTeam={highlightedTeam}
				highlightFunction={highlightFunction}/>);
			columns.push(<BracketColumn
				key={this.state.matches.quarterFinals.length}
				matches={this.state.matches.quarterFinals}
				date="30-3RD JULY"
				highlightedTeam={highlightedTeam}
				highlightFunction={highlightFunction}/>);
			columns.push(<BracketColumn
				key={this.state.matches.semiFinals.length}
				matches={this.state.matches.semiFinals}
				date="6-7TH JULY"
				highlightedTeam={highlightedTeam}
				highlightFunction={highlightFunction}/>);
			columns.push(<BracketColumn
				key={this.state.matches.finals.length}
				matches={this.state.matches.finals}
				date="10TH JULY"
				highlightedTeam={highlightedTeam}
				highlightFunction={highlightFunction}/>);
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
