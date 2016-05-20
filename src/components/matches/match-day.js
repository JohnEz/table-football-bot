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
							p1 = {result.winner}
							p2 = {result.loser}
							p1Score = {result.winScore}
							p2Score = {result.loseScore}
							/>
					)
				})}
			</div>
		);
	}
});

export default MatchDay;
