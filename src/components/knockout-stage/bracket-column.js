'use strict';

import React from 'react';

let bracketColumn = React.createClass({

	render: function() {
		let elements = [];
		let count = this.props.matches.length;
		let date = this.props.date;

		this.props.matches.map(function(match, index, array) {
			let team1Winner = '';
			let team2Winner = '';

			if (match.winner === 1) {
				team1Winner = 'won-game';
			} else if (match.winner === 2) {
				team2Winner = 'won-game';
			}

			elements.push(
				<div className={'ele c'+count+' c'+count+'e'+index} key ={'c'+count+'e'+index}>
					<div className={'team game-top '+team1Winner}> <div className='country'>{match.team1.country}</div> <div className='score'>{match.result.score1}</div> </div>
					<div className='upperLine'></div>
					<div className='lowerLine'></div>
					<div className={'team game-bottom '+team2Winner}> <div className='country'>{match.team2.country}</div> <div className='score'>{match.result.score2}</div> </div>
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
