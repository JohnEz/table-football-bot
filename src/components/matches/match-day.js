'use strict';

import React from 'react';
import MatchTableElement from './match-table-element.js';

var MatchDay = React.createClass({
	render: function() {
		return (
			<div className='match-day'>
				<div className='table-row table-date'>{this.props.day}</div>
				{this.props.results.map(function(result) {
					return (
						<MatchTableElement
							key={result.id}
							winner = {result.winner}
							loser = {result.loser}
							winnerScore = {result.winScore}
							loserScore = {result.loseScore}
							/>
					)
				})}
			</div>
		);
	}
});

export default MatchDay;
