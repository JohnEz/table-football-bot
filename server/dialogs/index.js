'use strict';

var builder = require('botbuilder');
var prompts = require('../prompts');
var config = require('../config');

/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model || config.luisToken;
var dialog = new builder.LuisDialog(model);
module.exports = dialog;

/** Answer users help requests. We can use a DialogAction to send a static message. */
dialog.on('Help', builder.DialogAction.send(prompts.helpMessage));

/** Prompts a user for the title of the task and saves it.  */
dialog.on('AddResult', [
	function (session, args, next) {
		// See if got the tasks title from our LUIS model.
		var p1 = builder.EntityRecognizer.findEntity(args.entities, 'player::p1');
		var p2 = builder.EntityRecognizer.findEntity(args.entities, 'player::p2');
		var s1 = builder.EntityRecognizer.findEntity(args.entities, 'score::s1');
		var s2 = builder.EntityRecognizer.findEntity(args.entities, 'score::s2');

		//TODO deal with the above not being found


		// pass the result to the next step.
		next({
			p1: p1.entity,
			p2: p2.entity,
			s1: s1.entity,
			s2: s2.entity
		});
	},
	function (session, results) {
		// Save the result
		if (!results.p1 || !results.p2 || isNaN(results.s1) || isNaN(results.s2)) {
			session.send(prompts.error);
		}
		else {
			var res = results.p1 +' '+ results.s1 + ' - ' + results.s2 + ' ' + results.p2;
			console.log(res);
			if (!session.userData.results) {
				session.userData.results = [res];
			} else {
				session.userData.results.push(res);
			}
			session.send(prompts.resultCreated, { result: res });
		}
	}
]);

/** Shows the user a list of tasks. */
dialog.on('ListResults', function (session) {
	if (session.userData.results && session.userData.results.length > 0) {
		var list = '';
		session.userData.results.forEach(function (value, index) {
			list += session.gettext(prompts.listResult, {result: value });
		});
		session.send(prompts.listResultsList, list);
	}
	else {
		session.send(prompts.listNoResult);
	}
});
