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
*   ROUTES
*/
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.post('/bot/results', function(req, res) {
    controller.getResultsTable(req.body.count, function(data, err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(data);
    });
});

app.post('/bot/users', function(req, res) {
    controller.getLeagueTable(function(data, err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(data);
    });
});

app.post('/bot/schedule', function(req, res) {
    controller.getMatchesToBePlayed(new Date(), null, null, function(data, err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json({today: data.today, overdue: data.overdue});
    });
});

app.post('/bot/future', function(req, res) {
    controller.getUpcomingMatches(req.body.count, function(data, err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(data);
    });
});

app.post('/bot/brackets', function(req, res) {
    controller.getBracketMatches(function(data) {
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
    controller.randomMessageSetup(slackbot);
});
