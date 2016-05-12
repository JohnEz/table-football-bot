'use strict';

var builder = require('botbuilder');
var prompts = require('../prompts');
var config = require('../config');
const capWrd = require('../util').capitaliseWords;
const createResultString = require('../util').createResultString;
const Controller = require('../controller/controller');
const slackBot = require('../slackbot');

/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model || config.luisToken;
var dialog = new builder.LuisDialog(model);
module.exports = dialog;

let controller = new Controller();


/** Return a default message if nothing else is recognised */
dialog.onDefault(builder.DialogAction.send(prompts.defaultReply));

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

		let result = session.dialogData.result = {
			p1: p1 ? p1.entity : null,
			p2: p2 ? p2.entity : null,
			s1: s1 ? s1.entity : null,
			s2: s2 ? s2.entity : null,
		};

		//ask for p1 if not provided
		if (!p1) {
			builder.Prompts.text(session, prompts.getFirstTeam);
		}
		else {
			next()
		}
	},
	function(session, results, next) {
		let result = session.dialogData.result;
		if (results.response) {
			result.p1 = results.response;
		}

		//ask for p2 if not provided
		if(result.p1 && !result.p2) {
			builder.Prompts.text(session,prompts.getSecondTeam);
		}
		else {
			next()
		}
	},
	function(session, results, next) {
		let result = session.dialogData.result;
		if (results.response) {
			result.p2 = results.response;
		}

		//ask for the score of team 1
		if(result.p1 && result.p2 && !result.s1) {
			builder.Prompts.number(session,'What did ' + capWrd(result.p1) + ' score?');
		}
		else {
			next()
		}
	},
	function(session, results, next) {
		let result = session.dialogData.result;
		if (results.response) {
			result.s1 = results.response;
		}

		//ask for p2 if not provided
		if(result.p1 && result.p2 && result.s1 && !result.s2) {
			builder.Prompts.number(session,'What did ' + capWrd(result.p2) + ' score?');
		}
		else {
			next()
		}
	},
	function(session, results) {
		let result = session.dialogData.result;
		if (results.response) {
			result.s2 = results.response;
		}

		if (result.p1 && result.p2 && result.s1 && result.s2){

			controller.submitResult(result.p1, result.p2, result.s1, result.s2, function(message, endResult) {

				//check it created a result
				if (endResult) {

					let difference = controller.checkScoreDifference(endResult.winnerScore, endResult.loserScore);

					//tell the winner he won
					if (endResult.winner.slackCode) {
						slackBot.sendMessage(endResult.winner.slackCode, `Congratulations on your win against ${endResult.loser.country}`);
					}

					//tell the user he lost
					if (endResult.loser.slackCode) {
						slackBot.sendMessage(endResult.loser.slackCode, `Sorry for your loss against ${endResult.winner.country}`);
					}

					//tell the main channel
					slackBot.sendMessage(config.mainChannel.code, `Result just in:\n${endResult.toString}`);

				} else {
					session.send(message, {player1: result.p1, player2: result.p2});
				}

			});

		} else {
			session.send(prompts.error);
		}
		session.endDialog();
	}
]);

/** Shows the user a list of tasks. */
dialog.on('ListResults', [
	function (session, args) {
		// See if got the tasks title from our LUIS model.
		let p1 = builder.EntityRecognizer.findEntity(args.entities, 'player::p1');
		let p2 = builder.EntityRecognizer.findEntity(args.entities, 'player::p2');
		let limit = builder.EntityRecognizer.findEntity(args.entities, 'limit');

		let request = {
			p1: p1 ? p1.entity : null,
			p2: p2 ? p2.entity : null,
			limit: limit ? limit.entity : null
		};

		controller.getResults(request.limit, request.p1, request.p2, function(resultsArray, err) {
			//if there was no error
			if (!err) {

				if (resultsArray.length > 0) {
					let resultsString = '';
					resultsArray.forEach(function(result) {
						resultsString = resultsString + createResultString(result.winner, result.loser, result.winnerScore, result.loserScore) + '\n';
					});

					session.send(prompts.listResultsList, resultsString);
				} else {
					session.send(prompts.listNoResult);
				}

			} else {
				session.send(prompts.databaseError);
			}
		});

		session.endDialog();
	}
]);
