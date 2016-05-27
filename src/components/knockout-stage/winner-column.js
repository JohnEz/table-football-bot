'use strict';

import React from 'react';

let winnerColumn = React.createClass({

	render: function() {

		return (
			<div className='bracket-column'>
				<div className='bracket-header'>
					<h3 className='column-date'>Winner</h3>
				</div>
				<div className='bracket-body'>
					<div className='winner-divider'></div>
					<div className='winner-divider winner-line'>
						<div className='trophy-container'><img className='trophy' src={require('../../img/trophy.png')}></img></div>
						<div className='winner-name'> <div>{this.props.winner}</div> </div>
					</div>
				</div>
			</div>
		);
	}

});

export default winnerColumn;
