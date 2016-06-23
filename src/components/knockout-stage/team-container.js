'use strict';

import React from 'react';

let TeamContainer = React.createClass({
	mouseOver: function () {
		this.props.highlightFunction(this.props.player);
	},
	mouseOut: function () {
		this.props.highlightFunction('');
	},
	render: function() {

		let containerClass = this.props.containerClass;
		let countryClass = this.props.countryClass;
		let player = this.props.player;
		let score = this.props.score;

		return (
			<div className={containerClass} title={player.slackID} onMouseEnter={this.mouseOver} onMouseLeave={this.mouseOut}>
				<div className={countryClass}>{player.country}</div>
				<div className='score'>{score}</div>
			</div>
		);
	}

});

export default TeamContainer;
