'use strict';

const path = require('path');
const express = require('express');
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
app.use(express.static(path.join(__dirname, 'build')));

/**
*   ROUTES
*/
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + 'build/index.html'));
});

app.get('/bot/results', function(req, res) {
    controller.getResultsTable(function(data, err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(data);
    });
});

app.get('/bot/users', function(req, res) {
    controller.getLeagueTable(function(data, err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(data);
    });
});

app.get('/bot/schedule', function(req, res) {
    controller.getMatchesToBePlayed(new Date(), null, null, function(data, err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(data);
    });
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
DAO.getInstance().init(function() {
    //run this code if the database was successfully setup
    console.log('Database setup complete');
    slackbot.startBot();
    controller.setupReminders(slackbot);
});
