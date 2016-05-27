'use strict';

import React from 'react';
import BracketColumn from './knockout-stage/bracket-column.js';

var KnockoutStage = React.createClass({
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
		}

		return (
			<div className="content">
				<div className="bracket">
					{columns}
					<div className='bracket-column'>
						<div className='bracket-header'>
							<h3 className='column-date'>Winner</h3>
						</div>
						<div className='bracket-body'>
							<div className='winner-divider'></div>
							<div className='winner-divider winner-line'>
								<div className='trophy-container'><img className='trophy' src={require('../img/trophy.png')}></img></div>
								<div className='winner-name'> <div>Winner</div> </div>
							</div>
						</div>
					</div>
					{spinner}
				</div>
			</div>

		);
	}
});

export default KnockoutStage;
