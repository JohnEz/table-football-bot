'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const Controller = require('./server/controller/controller.js');
const slackbot = require('./server/slackbot');
const controller = new Controller();

// process.env.PORT is heroku's assigned port
const PORT = process.env.PORT || 8000;

const app = express();

/**
*   MIDDLEWARE
*/
app.use('/src/video/', express.static(path.join(__dirname, 'build/src/video'), { maxage: 86400000 }));
app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/**
 * APP ROUTE
 */

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

/**
*   START SERVER
*/
app.listen(PORT, function(error) {
    if (error) {
        console.error(error);
    } else {
        console.info(`==> 🌎 Backend server listening on port ${PORT}.`);
    }
});

/**
*   INITIALISE THE DATABASE
*/
slackbot.startBot();
controller.setupReminders(slackbot);
controller.randomMessageSetup(slackbot);
