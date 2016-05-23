'use strict';

var builder = require('botbuilder');
var prompts = require('../prompts');
var config = require('../config');
const util = require('../util');
const Controller = require('../controller/controller');
const slackBot = require('../slackbot');
const moment = require('moment');

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
	getIntialAddInputs,
	askForPlayerOne,
	getPlayer('p1', prompts.player1NotFound),
	askForPlayerTwo,
	getPlayer('p2', prompts.player2NotFound),
	validatePlayers,
	askForFirstScore,
	getScore('s1'),
	askForSecondScore,
	getScore('s2'),
	validateScores,
	respondFinalResult
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
			limit: limit ? util.convertWordToNumber(limit.entity) : null
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
		controller.getAllPlayers(function(allPlayers) {

			let playersFound = util.getPlayerFromArray(user.entity, allPlayers);
			let player = playersFound[0];

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

/**shows upcoming matches to the user. */
dialog.on('UpcomingMatches', function(session, args) {

	controller.getMyMatches(session.userData.id, function(matches) {
		let matchesString = '';

		if(matches.overdue.length > 0) {
			matchesString = matchesString + ':rage: OVERDUE GAMES:\n';

			matches.overdue.forEach(function(match) {
				matchesString = matchesString + `${controller.convertPlayerToString(match.team1)} vs ${controller.convertPlayerToString(match.team2)} was ${moment(match.date).format('dddd Do MMMM')}\n`;
			});
			matchesString = matchesString + '\n';
		}

		if (matches.today.length > 0) {
			matchesString = matchesString + 'Today\'s games:\n';

			matches.today.forEach(function(match) {
				matchesString = matchesString + `${controller.convertPlayerToString(match.team1)} vs ${controller.convertPlayerToString(match.team2)}\n`;
			});
			matchesString = matchesString + '\n';
		}

		if (matches.upcoming.length > 0) {
			matchesString = matchesString + 'Upcoming games:\n';

			matches.upcoming.forEach(function(match) {
				matchesString = matchesString + `${controller.convertPlayerToString(match.team1)} vs ${controller.convertPlayerToString(match.team2)} on ${moment(match.date).format('dddd Do MMMM')}\n`;
			});
		}

		if (matchesString === '') {
			session.send(prompts.noGames);
		} else {
			session.send(matchesString);
		}

	});

});


function checkForMe(p, result, session) {
	let player = result[p];
	if (util.isMe(player)) {
		result[p] = session.userData.id;
	}
}

function getIntialAddInputs(session, args, next) {
	// See if got the tasks title from our LUIS model.
	let p1 = builder.EntityRecognizer.findEntity(args.entities, 'player::p1');
	let p2 = builder.EntityRecognizer.findEntity(args.entities, 'player::p2');
	let s1 = builder.EntityRecognizer.findEntity(args.entities, 'score::s1');
	let s2 = builder.EntityRecognizer.findEntity(args.entities, 'score::s2');
	let win = builder.EntityRecognizer.findEntity(args.entities, 'modifier::win');
	let loss = builder.EntityRecognizer.findEntity(args.entities, 'modifier::loss');

	let result = session.dialogData.result = {
		p1: p1 ? p1.entity : null,
		p2: p2 ? p2.entity : null,
		s1: s1 ? util.convertWordToNumber(s1.entity) : null,
		s2: s2 ? util.convertWordToNumber(s2.entity) : null,
		win: win !== null,
		loss: loss !== null
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
		next();
	});
}

function askForPlayerOne(session, results, next) {
	let playerDocs = session.dialogData.playerDocs;
	let result = session.dialogData.result;
	let validation = session.dialogData.validation;
	let foundString = '';

	//get matching players from array
	let playersFound = util.getPlayerFromArray(result.p1, playerDocs);
	result.p1 = null;
	if (playersFound.length > 1) {
		playersFound.forEach(function(player, index, array) {
			foundString = foundString + player.country + '|';
		});
		foundString = foundString.slice(0, foundString.length-1);

	} else if (playersFound.length === 1) {
		result.p1 = playersFound[0];
	}


	//ask for p1 if not provided or we couldn't find it
	if (!result.p1 && validation.passed) {
		if (foundString !== '') {
			builder.Prompts.choice(session, prompts.confirmPlayer1, foundString);
		} else {
			builder.Prompts.text(session, prompts.getFirstTeam);
		}
	}
	else {
		next();
	}
}

function askForPlayerTwo(session, results, next) {
	let playerDocs = session.dialogData.playerDocs;
	let result = session.dialogData.result;
	let validation = session.dialogData.validation;
	let foundString = '';

	//get matching players from array
	let playersFound = util.getPlayerFromArray(result.p2, playerDocs);
	result.p2 = null;
	if (playersFound.length > 1) {
		playersFound.forEach(function(player, index, array) {
			foundString = foundString + player.country + '|';
		});
		foundString = foundString.slice(0, foundString.length-1);

	} else if (playersFound.length === 1) {
		result.p2 = playersFound[0];
	}

	//ask for p2 if not provided
	if(result.p1 && !result.p2 && validation.passed) {
		if (foundString !== '') {
			builder.Prompts.choice(session, prompts.confirmPlayer2, foundString);
		} else {
			builder.Prompts.text(session, prompts.getSecondTeam);
		}
	}
	else {
		next()
	}
}

function getPlayer(player, failPrompt) {
	return function (session, results, next) {
		if (results.response) {
			if (results.response.entity) {
				results.response = results.response.entity;
			}

			let playerDocs = session.dialogData.playerDocs;
			let result = session.dialogData.result;
			result[player] = results.response;
			result[player] = removeIllegalCharacters(result[player]);
			checkForMe(player, result, session);

			let playersFound = util.getPlayerFromArray(result[player], playerDocs);

			session.dialogData.validation = controller.validatePlayer(playersFound, failPrompt);

			if (session.dialogData.validation.passed) {
				result[player] = playersFound[0];
			}

		}
		next();
	};
}

function validatePlayers(session, results, next) {
	let result = session.dialogData.result;

	//now we have the final player docs, do validation
	if (session.dialogData.validation.passed) {
		controller.getMatches(result.p1, result.p2, function(matches) {
			let match = controller.getValidMatch(matches);
			session.dialogData.validation = controller.validatePlayers(result.p1, result.p2, session.userData.id, matches.size, match);

			session.dialogData.match = match;

			next();
		});
	} else {
		next();
	}

}

function askForFirstScore(session, results, next) {
	let playerDocs = session.dialogData.playerDocs;
	let result = session.dialogData.result;
	let validation = session.dialogData.validation;

	//check the score is a valid score
	let scoreValidation = controller.validateScore(result.s1);

	//ask for the score of team 1
	if(result.p1 && result.p2 && (result.s1 === null || !scoreValidation.passed) && validation.passed) {
		builder.Prompts.text(session,`What did ${util.capitaliseWords(result.p1.country)} (${result.p1.slackID}) score? ${scoreValidation.message}`);
	}
	else {
		next()
	}
}

function askForSecondScore(session, results, next) {
	let result = session.dialogData.result;
	let validation = session.dialogData.validation;

	//check the score2 is a valid score
	if (validation.passed && result.s2) {
		session.dialogData.validation = validation = controller.validateScore(result.s2);
	}

	//ask for s2 if not provided
	if(result.p1 && result.p2 && result.s1 !== null && result.s2 === null && validation.passed) {
		builder.Prompts.text(session,`What did ${util.capitaliseWords(result.p2.country)} (${result.p2.slackID}) score? ${validation.message}`);
	}
	else {
		next()
	}
}

function getScore(score) {
	return function(session, results, next) {
		if (results.response) {
			let result = session.dialogData.result;
			result[score] = util.convertWordToNumber(results.response);
			session.dialogData.validation = controller.validateScore(result[score]);
		}

		next();
	};
}

function validateScores(session, results, next) {
	//check the re added score is a valid score
	if (session.dialogData.validation.passed) {
		let result = session.dialogData.result;
		session.dialogData.validation = controller.validateScores(result.s1, result.s2);
	}

	next();
}

function respondFinalResult(session, results) {
	let result = session.dialogData.result;
	let validation = session.dialogData.validation;

	if (result.p1 && result.p2 && result.s1 !== null && result.s2 !== null && validation.passed) {

		controller.submitResult(result.p1, result.p2, result.s1, result.s2, result.win, result.loss, session.dialogData.match, function(message, endResult) {
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
				let broadcast = prompts.result;
				if (difference === 3 ) broadcast = `<!channel> ${broadcast} :clap:`
				slackBot.sendMessage(config.mainChannel.code, broadcast, {result: endResult.toString});

			} else {
				session.send(message, {player1: result.p1, player2: result.p2});
			}

		});

	} else if (!validation.passed) {
		session.send(validation.message, {player1: result.p1, player2: result.p2});
	} else {
		session.send(prompts.error);
	}
	session.endDialog();
}

function removeIllegalCharacters(str) {
	return str.replace(/<|@|>/g, '');
}
