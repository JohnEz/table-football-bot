'use strict';

var Botkit = require('botkit');
var builder = require('botbuilder');
var index = require('./dialogs/index');

var Controller = require('./controller/controller');
var appController = new Controller();

var botController = Botkit.slackbot({
	debug: false,
	log: false
});
var bot = botController.spawn({
	token: require('./config').slackBotToken
});

var slackBot = new builder.SlackBot(botController, bot);
slackBot.add('/', index);

slackBot.add('/say', function(session, message) {
	session.endDialog(message);
});

slackBot.listenForMentions();

////// Exportable functions /////////

/* Wrap this in a function and run it once the database is setup
this is to avoid a race condition
*/
module.exports.startBot = function() {
	bot.startRTM(function(err,bot,payload) {
		if (err) {
			throw new Error('Could not connect to Slack');
		}
		let users = [];
		payload.users.forEach(function(user) {
			if (!user.is_bot && user.name !== 'slackbot') {
				users.push(
					{
						id: user.id,
						name: user.name,
						fname: user.profile.first_name,
					}
				);
			}
		});
		appController.addUsers(users);
	});
}

/* To get the user information from Slack
*/
module.exports.getUser = function (id, callback) {
	bot.api.users.info({user: id}, function(err, data) {
		if (err) {
			bot.botkit.log('Failed to find user info :(',err);
		}
		callback(data);
	});
}

/* To send a single messasge
channel is of the form 'D16BDMBGB' or 'C16CH0SNQ' and
message is a string.
*/
module.exports.sendMessage = function(channel, message) {
	slackBot.beginDialog({ channel: channel}, '/say', message);
}
