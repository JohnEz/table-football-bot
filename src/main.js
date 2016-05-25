'use strict';

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, hashHistory, IndexRoute } from 'react-router'

import App from './components/app';
import GroupStage from './components/group-stage';
import KnockoutStage from './components/knockout-stage';
require('./styles.scss');


render((
	<Router history={hashHistory}>
		<Route path="/" component={App}>
            <IndexRoute component={GroupStage}/>
			<Route path="/group" component={GroupStage}/>
			<Route path="/knockout" component={KnockoutStage}/>
		</Route>
	</Router>
), document.getElementById('app'))
