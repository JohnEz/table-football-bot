
var builder = require('botbuilder');
var index = require('./dialogs/index')

var textBot = new builder.TextBot();
textBot.add('/', index);

textBot.listenStdin();
