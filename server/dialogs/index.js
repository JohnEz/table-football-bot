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
		let p1 = builder.EntityRecognizer.findEntity(args.entities, 'player::p1');
		let p2 = builder.EntityRecognizer.findEntity(args.entities, 'player::p2');
		let s1 = builder.EntityRecognizer.findEntity(args.entities, 'score::s1');
		let s2 = builder.EntityRecognizer.findEntity(args.entities, 'score::s2');

		//TODO deal with the above not being found
		if (!p1 || !p2 || !s1 || !s2) {
			session.send(prompts.notEnoughData);
		}
		// got all 4 pieces of data process it
		else {
			var res = p1.entity +' '+ s1.entity + ' - ' + s2.entity + ' ' + p2.entity;
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
