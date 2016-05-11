'use strict';

var Botkit = require('botkit');
var builder = require('botbuilder');
var index = require('./dialogs/index');

var controller = Botkit.slackbot();
var bot = controller.spawn({
	token: require('./config').slackBotToken
});

var slackBot = new builder.SlackBot(controller, bot);
slackBot.add('/', index);

slackBot.listenForMentions();

bot.startRTM(function(err,bot,payload) {
	if (err) {
		throw new Error('Could not connect to Slack');
	}
});

slackBot.add('/say', function(session, message) {
	session.endDialog(message);
})

////// Exportable functions /////////

	/* To send a single messasge
		channel is of the form 'D16BDMBGB' or 'C16CH0SNQ' and
		message is a string.
		*/
module.exports.sendMessage = function(channel, message) {
	slackBot.beginDialog({ channel: channel}, '/say', message);
}
