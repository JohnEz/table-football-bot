'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const DAO = require('./server/controller/dao.js');
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
DAO.getInstance().init(function() {
    //run this code if the database was successfully setup
    console.log('Database setup complete');
    slackbot.startBot();
    controller.setupReminders(slackbot);
    controller.randomMessageSetup(slackbot);
});
