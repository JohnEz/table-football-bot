'use strict';

import React from 'react';

import TeamContainer from './team-container.js';

let bracketColumn = React.createClass({

	render: function() {
		let elements = [];
		let count = this.props.matches.length;
		let date = this.props.date;
		let highlightedTeam = this.props.highlightedTeam;
		let highlightFunction = this.props.highlightFunction;

		this.props.matches.sort(function(a, b) {
			return a.matchNumber - b.matchNumber;
		});

		this.props.matches.map(function(match, index, array) {
			let team1Winner = '';
			let team2Winner = '';
			let upperHighlight = '';
			let lowerHighlight = '';
			let team1 = match.team1;
			let team2 = match.team2;


			if (match.winner === 1) {
				team1Winner = 'won-game ';
			} else if (match.winner === 2) {
				team2Winner = 'won-game ';
			}

			if (team1.country === highlightedTeam) {
				upperHighlight = 'highlighted ';
			} else if (team2.country === highlightedTeam){
				lowerHighlight = 'highlighted ';
			}

			elements.push(
				<div className={'ele c'+count+' c'+count+'e'+index} key ={'c'+count+'e'+index}>
					<TeamContainer
						containerClass={'team game-top '+team1Winner}
						countryClass={'country '+upperHighlight}
						player={team1} score={match.result.score1}
						highlightFunction={highlightFunction}/>
					<div className={'upperLine '+upperHighlight}></div>
					<div className={'lowerLine '+lowerHighlight}></div>
					<TeamContainer
						containerClass={'team game-bottom '+team2Winner}
						countryClass={'country '+lowerHighlight}
						player={team2}
						score={match.result.score2}
						highlightFunction={highlightFunction}/>
				</div>
			);

		});
		return (
			<div className='bracket-column'>
				<div className='bracket-header'>
					<h3 className='column-date'>{date}</h3>
				</div>
				<div className='bracket-body'>
					{elements}
				</div>
			</div>
		);
	}

});

export default bracketColumn;
