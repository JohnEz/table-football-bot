'use strict';

import React from 'react';
import MatchTableElement from './match-table-element.js';
import moment from 'moment';

var MatchDay = React.createClass({
	render: function() {
		return (
			<div className='match-day'>
				<div className='table-row table-date'>{moment(this.props.day).format('dddd Do MMMM')}</div>
				{this.props.results.map(function(result) {
					return (
						<MatchTableElement
							key={result.id}
							p1 = {result.player1}
							p2 = {result.player2}
							p1Score = {result.score1}
							p2Score = {result.score2}
							/>
					)
				})}
			</div>
		);
	}
});

export default MatchDay;
