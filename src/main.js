'use strict';

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, browserHistory, IndexRoute } from 'react-router'

import App from './components/app';
import GroupStage from './components/group-stage';
import Bracket from './components/tournament-bracket/bracket';
import PageNotFound from './components/page-not-found';
require('./styles.scss');


render((
	<Router history={browserHistory}>
		<Route path="/" component={App}>
            <IndexRoute component={GroupStage}/>
			<Route path="/group" component={GroupStage}/>

			<Route path="/knockout" component={Bracket}/>
			<Route path="*" component={PageNotFound} />
		</Route>
		<Route path="*" component={PageNotFound} />
	</Router>
), document.getElementById('app'))
