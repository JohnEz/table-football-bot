'use strict';

var builder = require('botbuilder');
var prompts = require('../prompts');
var config = require('../config');
const util = require('../util');
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

/** Prompts a user for the two teams and their scores and saves it.  */
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

		checkForMe('p1', result, session);
		checkForMe('p2', result, session);

		let validation = session.dialogData.validation = {
			passed: true,
			message: 'Error'
		};

		//get all players from the database
		controller.getAllPlayers(function(playersArray) {
			session.dialogData.playerDocs = playersArray;
			//get player from array
			let playerDoc = util.getPlayerFromArray(result.p1, playersArray);

			session.dialogData.result.p1 = playerDoc;

			//ask for p1 if not provided or we couldn't find it
			if (!playerDoc && validation.passed) {
				builder.Prompts.text(session, prompts.getFirstTeam);
			}
			else {
				next()
			}
		});
	},
	function(session, results, next) {
		let playerDocs = session.dialogData.playerDocs;
		let result = session.dialogData.result;
		let validation = session.dialogData.validation;

		if (results.response) {
			result.p1 = results.response;
			checkForMe('p1', result, session);
			result.p1 = util.getPlayerFromArray(results.p1, playerDocs);
		}

		result.p2 = util.getPlayerFromArray(result.p2, playerDocs);

		//ask for p2 if not provided
		if(result.p1 && !result.p2 && validation.passed) {
			builder.Prompts.text(session,prompts.getSecondTeam);
		}
		else {
			next()
		}
	},
	function(session, results, next) {
		let playerDocs = session.dialogData.playerDocs;
		let result = session.dialogData.result;
		let validation = session.dialogData.validation;

		if (results.response) {
			result.p2 = results.response;
			checkForMe('p2', result, session);
			result.p2 = util.getPlayerFromArray(results.p2, playerDocs);
		}

		//now we have the final player docs, do validation
		if (validation.passed) {
			session.dialogData.validation = validation = controller.validatePlayers(result.p1, result.p2);
		}

		//check the score is a valid score
		let scoreValidation = controller.validateScore(result.s1);

		//ask for the score of team 1
		if(result.p1 && result.p2 && (!result.s1 || !scoreValidation.passed) && validation.passed) {
			builder.Prompts.number(session,`What did ${util.capitaliseWords(result.p1.country)} (${result.p1.slackID}) score? ${scoreValidation.message}`);
		}
		else {
			next()
		}
	},
	function(session, results, next) {
		let result = session.dialogData.result;
		let validation = session.dialogData.validation;

		if (results.response) {
			result.s1 = results.response;
			session.dialogData.validation = validation = controller.validateScore(result.s1);
			console.log(validation);
		}

		//check the score2 is a valid score
		if (validation.passed && result.s2) {
			session.dialogData.validation = validation = controller.validateScore(result.s2);
		}

		console.log(validation);

		//ask for s2 if not provided
		if(result.p1 && result.p2 && result.s1 && !result.s2 && validation.passed) {
			builder.Prompts.number(session,`What did ${util.capitaliseWords(result.p2.country)} (${result.p2.slackID}) score? ${validation.message}`);
		}
		else {
			next()
		}
	},
	function(session, results) {
		let result = session.dialogData.result;
		let validation = session.dialogData.validation;

		if (results.response) {
			result.s2 = results.response;
			validation = controller.validateScore(result.s2);
		}

		//check the re added score is a valid score
		if (validation.passed) {
			validation = controller.validateScores(result.s1, result.s2);
		}

		if (result.p1 && result.p2 && result.s1 && result.s2 && validation.passed) {

			controller.submitResult(result.p1, result.p2, result.s1, result.s2, function(message, endResult) {
				//check it created a result
				if (endResult) {

					let difference = controller.checkScoreDifference(endResult.winnerScore, endResult.loserScore);
					// difference is 1-10 for to get correct messages from array we need (0-9) / 3
					difference = Math.floor((difference - 1) / 3);
					//tell the winner he won
					if (endResult.winner.slackCode) {
						slackBot.sendMessage(endResult.winner.slackCode, prompts.winMessage[difference] , {country: endResult.loser.country});
					}

					//tell the user he lost
					if (endResult.loser.slackCode) {
						slackBot.sendMessage(endResult.loser.slackCode, prompts.loseMessage[difference], {country: endResult.winner.country});
					}

					//tell the main channel
					slackBot.sendMessage(config.mainChannel.code, prompts.result, {result: endResult.toString});

				} else {
					session.send(message, {player1: result.p1, player2: result.p2});
				}

			});

		} else if (!validation.passed) {
			session.send(validation.message);
		} else {
			session.send(prompts.error);
		}
		session.endDialog();
	}
]);

/** Shows the user a list of Results. */
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

		checkForMe('p1', request, session);
		checkForMe('p2', request, session);

		controller.getResults(parseInt(request.limit), request.p1, request.p2, function(resultsArray, err) {
			//if there was no error
			if (!err) {

				if (resultsArray.length > 0) {
					let resultsString = '';
					resultsArray.forEach(function(result) {
						resultsString = resultsString + util.createResultString(result.winner, result.loser, result.winnerScore, result.loserScore) + '\n';
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

/**Shows the user who is a country or user. */
dialog.on('WhoIs', function(session, args) {
	let user = builder.EntityRecognizer.findEntity(args.entities, 'player');
	if (user) {
		controller.getPlayer(user.entity, function(player) {
			if (player) {
				let slack = player.slackCode ? player.slackCode : player.slackID
				session.send(`<@${slack}> plays as ${player.country}`);
			}
			else {
				session.send('No player found');
			}
		});
	}
	else {
		session.send(prompts.error);
	}
	session.endDialog()
});

function checkForMe(p, result, session) {
	let player = result[p];
	if (util.isMe(player)) {
		result[p] = session.userData.id;
	}
}
