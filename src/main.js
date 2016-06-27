'use strict';

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, browserHistory, IndexRedirect } from 'react-router'

import App from './components/app';
import GroupStage from './components/group-stage';
import KnockoutStage from './components/knockout-stage';
import PageNotFound from './components/page-not-found';
require('./styles/styles.scss');

render((
	<Router history={browserHistory}>
		<Route path="/" component={App}>
            <IndexRedirect to= '/knockout' />
			<Route path="group" component={GroupStage}/>
			<Route path="knockout" component={KnockoutStage}/>
			<Route path="*" component={PageNotFound} />
		</Route>
		<Route path="*" component={PageNotFound} />
	</Router>
), document.getElementById('app'))
