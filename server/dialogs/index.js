'use strict';

var builder = require('botbuilder');
var prompts = require('../prompts');
var config = require('../config');
const util = require('../util');
const Controller = require('../controller/controller');
const slackBot = require('../slackbot');
const moment = require('moment');

/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.LUIS_TOKEN || config.luisToken;
var dialog = new builder.LuisDialog(model);
module.exports = dialog;

let controller = new Controller();


/** Return a default message if nothing else is recognised */
dialog.onDefault(builder.DialogAction.send(prompts.defaultReply));

dialog.on('Greeting', function(session, args) {
	if (Math.random() > 0.8) {
		util.getGiphyURL('hello', function(url) {
			session.endDialog(url);
		});
	}
	else {
		session.endDialog(util.getRandomMessage('greetingReply'));
	}

});

dialog.on('Thank', function(session, args) {

	//get the user that thanked blatter
	let playerID = session.userData.id;
	let playerName = null;

	controller.getPlayer(playerID, function(player) {
		if (player) {
			playerName = player.fname;
		}
		//send the reply
		session.endDialog(util.getRandomMessage('replyToThank'), {player: playerName});
	})

});

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
dialog.on('ListResults', function (session, args) {
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
					resultsString = resultsString + util.createResultString(result.player1, result.player2, result.score1, result.score2) + '\n';
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
});

/**Shows the user who is a country or user. */
dialog.on('WhoIs', function(session, args) {
	let user = builder.EntityRecognizer.findEntity(args.entities, 'player') ||
	builder.EntityRecognizer.findEntity(args.entities, 'player::p2') ||
	builder.EntityRecognizer.findEntity(args.entities, 'player::p1') ||
	null;
	let isMe = null;

	if (user) {

		isMe = isItMe(user.entity, session);

		if (isMe) {
			user.entity = isMe;
		}

		controller.getAllPlayers(function(allPlayers) {

			let playersFound = util.getPlayerFromArray(user.entity, allPlayers);
			let player = playersFound[0];

			if (player) {
				let slack = player.slackCode ? player.slackCode : player.slackID
				session.send(`<@${slack}> plays as ${util.capitaliseWords(player.country)}`);
			}
			else {
				if (isMe) {
					session.send(prompts.notInLeague);
				} else {
					session.send(prompts.playerNotFound);
				}
			}
		});
	}
	else {
		session.send(prompts.playerNotFound);
	}
	session.endDialog()
});

/**shows upcoming matches to the user. */
dialog.on('UpcomingMatches', function(session, args) {

	let team1 = builder.EntityRecognizer.findEntity(args.entities, 'player::p1');
	let team2 = builder.EntityRecognizer.findEntity(args.entities, 'player::p2');

	if (team1) {
		team1 = team1.entity;
	}

	if (team2) {
		team2 = team2.entity;
	}

	let team1IsMe = isItMe(team1, session);
	let team2IsMe = isItMe(team2, session);

	if (team1IsMe) {
		team1 = team1IsMe;
	}

	if (team2IsMe) {
		team2 = team2IsMe;
	}

	controller.getMatchesBetween(team1, team2, session.userData.id, function(matches, includesUser, err) {

		if (err) {
			session.send(err);
		} else {
			let numberOfMatches =  matches.overdue.length + matches.today.length + matches.upcoming.length;

			if (numberOfMatches > 1) {
				outputMatches(session, matches, includesUser);
			} else if (numberOfMatches === 1) {
				let user = null;

				if (includesUser) {
					user = session.userData.id;
				}

				outputMatch(session, matches, user);
			} else {
				console.log('No matches m9');
			}

		}

	});

});

dialog.on('Schedule', function(session, args, next) {

	if (config.admins.indexOf(session.userData.id) === -1 ){
		session.endDialog(prompts.notAdmin, {intent: 'schedule games', url: 'http://www.abc.net.au/cm/lb/6516842/data/sepp-blatter-at-2014-fifa-congress-data.jpg'});
		return; // annoyingly endDialog doesn't end the dialog!
	}

	let p1 = builder.EntityRecognizer.findEntity(args.entities, 'player::p1');
	let p2 = builder.EntityRecognizer.findEntity(args.entities, 'player::p2');
	let date = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.date');
	let matchCode = builder.EntityRecognizer.findEntity(args.entities, 'matchCode');

	let schedule = {
		p1: p1 ? p1.entity : null,
		p2: p2 ? p2.entity : null,
		date: date && date.resolution ? date = util.parseLuisDate(date.resolution.date) : null,
		matchCode: matchCode ? matchCode.entity : null
	};

	if (isNaN(schedule.date.getTime())) {
		session.endDialog(prompts.cantParseDate);
	}
	else {
		controller.addMatch(schedule.p1, schedule.p2, schedule.date, schedule.matchCode, function(match) {
			if(!match.error) {
				session.endDialog(prompts.scheduleSuccess, match)
			}
			else {
				session.endDialog(match.message, match.args);
			}

		});
	}
});

dialog.on('Announce', function(session, args, next) {
	if (config.admins.indexOf(session.userData.id) > -1) {
		let message = session.message.channelData.text;
		let messageStart = message.indexOf('\"');

		message = message.slice(messageStart+1, message.length-1);

		slackBot.sendMessage(config.mainChannel.code, message);

		session.endDialog(prompts.announcementSent);
	} else {
		session.endDialog(prompts.defaultReply);
	}
});

function checkForMe(p, result, session) {
	let player = result[p];
	if (util.isMe(player)) {
		result[p] = session.userData.id;
	}
}

function isItMe(input, session) {
	let id = null;
	if(util.isMe(input)) {
		id = session.userData.id;
	}
	return id;
}

function getIntialAddInputs(session, args, next) {
	// See if got the tasks title from our LUIS model.
	let p1 = builder.EntityRecognizer.findEntity(args.entities, 'player::p1');
	let p2 = builder.EntityRecognizer.findEntity(args.entities, 'player::p2');
	let s1 = builder.EntityRecognizer.findEntity(args.entities, 'score::s1');
	let s2 = builder.EntityRecognizer.findEntity(args.entities, 'score::s2');
	let win = builder.EntityRecognizer.findEntity(args.entities, 'modifier::win');
	let loss = builder.EntityRecognizer.findEntity(args.entities, 'modifier::loss');
	let draw = builder.EntityRecognizer.findEntity(args.entities, 'modifier::draw');

	if (!config.canAddResults) {
		session.send(prompts.cannotAddResults);
		return;
	}

	let result = session.dialogData.result = {
		p1: p1 ? p1.entity : null,
		p2: p2 ? p2.entity : null,
		s1: s1 ? util.convertWordToNumber(s1.entity) : null,
		s2: s2 ? util.convertWordToNumber(s2.entity) : null,
		win: win !== null,
		loss: loss !== null,
		draw: draw !== null
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
			result[player] = results.response.toLowerCase();
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
		session.dialogData.validation = controller.validateScores(result.s1, result.s2, result.win, result.loss, result.draw);
	}

	next();
}

function respondFinalResult(session, results) {
	let result = session.dialogData.result;
	let validation = session.dialogData.validation;

	if (result.p1 && result.p2 && result.s1 !== null && result.s2 !== null && validation.passed) {

		controller.submitResult(result.p1, result.p2, result.s1, result.s2, result.win, result.loss, result.draw, session.dialogData.match, function(message, endResult) {
			//check it created a result
			if (endResult) {

				let difference = controller.checkScoreDifference(endResult.score1, endResult.score2);
				let maxDifference = prompts.winMessage.length-1;

				// difference is 1-10 for to get correct messages from array we need (0-9) / 3
				difference = Math.floor((difference - 1) / 3);

				if (difference > maxDifference) {
					difference = maxDifference;
				}

				let resultMessages = controller.calculateResultsMessages(endResult.score1, endResult.score2, difference);

				//tell the winner he won
				if (endResult.player1.slackCode) {
					slackBot.sendMessage(endResult.player1.slackCode, resultMessages.player1Message, {country: util.capitaliseWords(endResult.player2.country)});
				}

				//tell the user he lost
				if (endResult.player2.slackCode) {
					slackBot.sendMessage(endResult.player2.slackCode, resultMessages.player2Message, {country: util.capitaliseWords(endResult.player1.country)});
				}

				//tell the main channel
				let broadcast = prompts.result;
				if (difference === maxDifference && (endResult.score1 === 0 || endResult.score2 === 0)) {
					broadcast = `<!channel> ${broadcast} :clap:`
				}
				slackBot.sendMessage(config.mainChannel.code, broadcast, {result: endResult.toString});

				controller.calculateKnockoutMatch(session.dialogData.match, endResult);
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

function outputMatch(session, matches, user) {
	let message = prompts.error;
	let match = null;
	let team1 = null;
	let team2 = null;
	let messageType = 0; // 0 = multiple, 1 = single

	//if there is a user, we only need to say 1 team
	if (user) {
		messageType = 1;
	}

	if (matches.overdue.length > 0) {
		match = matches.overdue[0];
		message = prompts.gameOverdue[messageType];
	} else if (matches.today.length > 0) {
		match = matches.today[0];
		message = prompts.gameToday[messageType];
	} else if (matches.upcoming.length > 0) {
		match = matches.upcoming[0];
		message = prompts.gameUpcoming[messageType];
	}

	if (user) {
		if (match.team1.slackCode === user) {
			team1 = controller.convertPlayerToString(match.team2);
		} else {
			team1 = controller.convertPlayerToString(match.team1);
		}
	} else {
		team1 = controller.convertPlayerToString(match.team1);
		team2 = controller.convertPlayerToString(match.team2);
	}

	let date = moment(match.date).format('dddd Do MMMM');

	session.send(message, {team1: team1, team2: team2, date: date});
}

function outputMatches(session, matches, includesUser) {
	let matchesString = '';

	let remainingResults = config.maxResults;

	if(matches.overdue.length > 0 && remainingResults > 0) {

		if (includesUser) {
			matchesString = matchesString + ':rage: OVERDUE GAMES:\n';
		} else {
			matchesString = matchesString + 'Overdue games:\n';
		}

		matches.overdue.forEach(function(match) {
			if (remainingResults > 0) {
				matchesString = matchesString +
					`${controller.convertPlayerToString(match.team1)} vs ${controller.convertPlayerToString(match.team2)} was meant to be played on ${moment(match.date).format('dddd Do MMMM')}\n`;
				remainingResults--;
			}
		});
		matchesString = matchesString + '\n';
	}

	if (matches.today.length > 0  && remainingResults > 0) {
		matchesString = matchesString + 'Today\'s games:\n';

		matches.today.forEach(function(match) {
			if (remainingResults > 0) {
				matchesString = matchesString + `${controller.convertPlayerToString(match.team1)} vs ${controller.convertPlayerToString(match.team2)}\n`;
				remainingResults--;
			}
		});
		matchesString = matchesString + '\n';
	}

	if (matches.upcoming.length > 0  && remainingResults > 0) {
		matchesString = matchesString + 'Upcoming games:\n';

		matches.upcoming.forEach(function(match) {
			if (remainingResults > 0) {
				matchesString = matchesString + `${controller.convertPlayerToString(match.team1)} vs ${controller.convertPlayerToString(match.team2)} on ${moment(match.date).format('dddd Do MMMM')}\n`;
				remainingResults--;
			}
		});
	}

	session.send(matchesString);
}
