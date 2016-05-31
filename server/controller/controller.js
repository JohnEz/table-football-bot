'use strict';
const DAO = require('./dao.js');
const prompts = require('../prompts.js');
const MAXRESULTS = require('../config').maxResults;
const admins = require('../config').admins;
const moment = require('moment');
const util = require('../util');
const Reminder = require('reminder');
const remind = new Reminder();
const mainChannel = require('../config').mainChannel;

class Controller {
    constructor() {

    }

    setupReminders(slackBot){
        remind.every('08:59', function(date) {

            // setup the random messages to be sent today
            this.getTodaysRandomMessages(4, slackBot);

            console.log('<-- Sending reminders -->');
            // send reminders for overdue and todays games
            this.getMatchesToBePlayed(date, null, null, function(matches) {

                matches.today.forEach(function(match) {
                    if (match.team1.slackCode) {
                        slackBot.sendMessage(match.team1.slackCode, prompts.matchToday, { opponent: this.convertPlayerToString(match.team2) });
                    }

                    if (match.team2.slackCode) {
                        slackBot.sendMessage(match.team2.slackCode, prompts.matchToday, { opponent: this.convertPlayerToString(match.team1) });
                    }
                }.bind(this));

                matches.overdue.forEach(function(match) {
                    if (match.team1.slackCode) {
                        slackBot.sendMessage(match.team1.slackCode, prompts.matchOverdue, { opponent: this.convertPlayerToString(match.team2) });
                    }

                    if (match.team2.slackCode) {
                        slackBot.sendMessage(match.team2.slackCode, prompts.matchOverdue, { opponent: this.convertPlayerToString(match.team1) });
                    }
                }.bind(this));

                console.log('<-- Reminders sent -->');

            }.bind(this));
        }.bind(this));
    }

    getMatchesToBePlayed(date, team1, team2, callback) {

        DAO.getInstance().getMatches(team1, team2, function(matchesMap) {

            let todaysGames = [];
            let overdueGames = [];
            let upcomingGames = [];

            matchesMap.forEach(function(match) {

                //if it has a date set, and no results given
                if (match.date && !match.result) {

                    let whenToPlay = this.compareMatchDate(date, match);

                    //check if its meant to be played today
                    if (whenToPlay === 0) {
                        todaysGames.push(match);
                    } else if ( whenToPlay === -1 ) {
                        // if its not meant to be played today, check if it was last month or earlier this month
                        overdueGames.push(match);
                    } else {
                        upcomingGames.push(match);
                    }
                }

            }.bind(this));

            callback( { today: todaysGames, overdue: overdueGames, upcoming: upcomingGames } );
        }.bind(this));
    }

    getUpcomingMatches(callCount, callback) {

        DAO.getInstance().getMatches(null, null, function(matchesMap) {

            let upcoming = new Map()

            matchesMap.forEach(function(match) {

                if (match.date && !match.result) {
                    let whenToPlay = this.compareMatchDate(new Date(), match);
                    //check if its meant to be played in the future
                    if (whenToPlay === 1) {
                        let day = moment(match.date).format('YYYY-MM-DD');
                        let game = {
                            id: match._id,
                            player1: match.team1.country,
                            player2:  match.team2.country,
                            score1: 'vs',
                            score2: '',
                        };

                        if(upcoming.has(day)){
                            upcoming.get(day).matches.push(game);
                        }
                        else {
                            upcoming.set(day, {date: day, matches: [game]});
                        }
                    }
                }

            }.bind(this));

            let matches = [...upcoming.values()].sort(function(a,b) {
                let val = 0;
                if (a.date < b.date) {
                    val = -1;
                }
                else if (a.date > b.date) {
                    val = 1;
                }
                return val;
            });
            callback(matches.slice(0, 2*callCount));

        }.bind(this));
    }

    getSlackHandle(player) {
        let slackName = `(@${player.slackID})`;
        if (player.slackCode) {
            slackName = `(<@${player.slackCode}>)`;
        }

        return slackName;
    }

    //returns -1 (overdue), 0 (today), 1 (upcoming)
    compareMatchDate(date, match) {
        let outcome = 1;

        //check if its meant to be played today
        if (match.date.getDate() === date.getDate() && match.date.getMonth() === date.getMonth()) {
            outcome = 0;
        } else if ( match.date.getMonth() < date.getMonth() || (match.date.getDate() < date.getDate() && match.date.getMonth() === date.getMonth()) ) {
            // if its not meant to be played today, check if it was last month or earlier this month
            outcome = -1;
        }

        return outcome;
    }

    getMyMatches(id, callback) {
        DAO.getInstance().getPlayer(id, function(player) {
            this.getMatchesToBePlayed(new Date(), player._id, null, callback);
        }.bind(this));
    }

    validatePlayer(playersFound, notFoundPrompt) {
        let pass = true;
        let errorMessage = '';
        if (playersFound.length === 0) {
            pass = false;
            errorMessage = notFoundPrompt;
        } else if (playersFound.length > 1) {
            pass = false;
            errorMessage = prompts.tooManyPlayersFound;
        }

        return {passed: pass, message: errorMessage};
    }

    validatePlayers(player1Doc, player2Doc, myID, matchesCount, match) {
        let pass = true;
        let errorMessage = '';

        if (!player1Doc) {
            errorMessage = prompts.player1NotFound;
            pass = false;
        } else if (!player2Doc) {
            errorMessage = prompts.player2NotFound;
            pass = false;
        } else if (player1Doc._id.equals(player2Doc._id)) {
            errorMessage = prompts.sameTeamEntered;
            pass = false;
        } else if (matchesCount === 0) {
            errorMessage = prompts.noMatchFound;
            pass = false;
        } else if (!match) {
            errorMessage = prompts.allMatchesHaveResults;
            pass = false;
        } else if (player1Doc.slackCode !== myID && player2Doc.slackCode !== myID && admins.indexOf(myID) === -1) {
            errorMessage = prompts.notOwner;
            pass = false;
        }

        return {passed: pass, message: errorMessage};
    }

    validateScore(score) {
        let pass = true;
        let errorMessage = '';

        if (score !== null) {
            score = parseInt(score);

            if (score < 0) {
                errorMessage = prompts.negativeScore;
                pass = false;
            }
        } else {
            pass = false;
        }

        return {passed: pass, message: errorMessage};
    }

    validateScores(score1, score2, win, loss, draw) {
        let pass = true;
        let errorMessage = '';

        score1 = parseInt(score1);
        score2 = parseInt(score2);

        if (win || loss) {
            //scores cannot be equal
            if(score1 === score2) {
                errorMessage = prompts.cannotBeEqualScores;
                pass = false;
            }
        } else if (draw) {
            if(score1 !== score2) {
                errorMessage = prompts.shouldHaveSameScore;
                pass = false;
            }
        }

        return {passed: pass, message: errorMessage};
    }

    submitResult(player1, player2, score1, score2, win, loss, draw, match, callback) {

        let intScoreLeft = parseInt(score1);
        let intScoreRight = parseInt(score2);
        let playersSwitched = false;

        //if player 1 is not the player 1 of the match
        if (player1.country !== match.team1.country) {
            //swap the players
            let storePlayer = player2;
            player2 = player1;
            player1 = storePlayer;
            playersSwitched = true;
        }

        let leftScoreIsBigger = intScoreLeft > intScoreRight;

        //if the scores need to be switched
        if (((leftScoreIsBigger === playersSwitched) && win) ||
        ((leftScoreIsBigger !== playersSwitched) && loss) ||
        (!win && !loss && playersSwitched)) {
            let storeScore = intScoreRight;
            intScoreRight = intScoreLeft;
            intScoreLeft = storeScore;
        }

        //atempt to add the results
        DAO.getInstance().addResult(player1._id, player2._id, intScoreLeft, intScoreRight, match, function(added) {
            //if the results were added successfully
            if (added) {
                let player1String = this.convertPlayerToString(player1);
                let player2String = this.convertPlayerToString(player2);

                let result = {
                    player1: player1,
                    player2: player2,
                    score1: intScoreLeft,
                    score2: intScoreRight,
                    toString: util.createResultString(player1String, player2String, intScoreLeft, intScoreRight)
                };

                //return the added message
                callback(prompts.resultCreated, result);
            } else {
                //else there must have been an error with the database
                //return the defualt database error message
                callback(prompts.databaseError);
            }
        }.bind(this));

    }

    getResults(count, player1, player2, callback) {

        if (!count || count > MAXRESULTS || count < 1) {
            count = MAXRESULTS;
        }

        //get the documents for the players
        DAO.getInstance().getPlayers(player1, player2, function(player1Doc, player2Doc) {
            //get the results between the players
            DAO.getInstance().getResults(count, player1Doc, player2Doc, function(results, err) {

                if (!err) {

                    results.forEach(function(result) {
                        result.player1 = this.convertPlayerToString(result.player1);
                        result.player2 = this.convertPlayerToString(result.player2);
                    }.bind(this));

                    callback(results, null);
                } else {
                    callback(null, err);
                }

            }.bind(this));

        }.bind(this));

    }

    getAllPlayers(callback) {
        DAO.getInstance().getAllPlayers(function(playersMap) {
            callback([...playersMap.values()]);
        });
    }

    getLeagueTable(callback) {
        var table = [];
        DAO.getInstance().getAllPlayers(function(players) {
            let allPlayers = players;
            allPlayers.forEach(function(player) {
                Object.assign(
                    player,
                    {
                        won: 0,
                        lost: 0,
                        draw: 0,
                        for: 0,
                        against: 0
                    }
                );
            });
            DAO.getInstance().getResults(null, null, null, function(results) {

                results.forEach(function(result) {
                    let player1 = allPlayers.get(JSON.stringify(result.player1._id));
                    let player2 = allPlayers.get(JSON.stringify(result.player2._id));
                    if (result.score1 > result.score2) {
                        player1.won++;
                        player2.lost++;
                    }
                    else if (result.score1 < result.score2) {
                        player2.won++;
                        player1.lost++;
                    }
                    else {
                        player1.draw++;
                        player2.draw++;
                    }

                    player1.for += result.score1;
                    player1.against += result.score2;
                    player2.for += result.score2;
                    player2.against += result.score1;

                });
                callback([...allPlayers.values()]);
            });
        });
    }

    getResultsTable(callCount, callback) {
        DAO.getInstance().getResults(callCount*10, null, null, function(results, err) {
            if (!err) {
                let days = new Map();
                results.forEach(function(result) {
                    let day = moment(result.date).format('YYYY-MM-DD');
                    let res = {
                        id: result._id,
                        player1: result.player1.country,
                        player2:  result.player2.country,
                        score1: result.score1,
                        score2: result.score2,
                    };

                    if(days.has(day)){
                        days.get(day).results.push(res);
                    }
                    else {
                        days.set(day, {date: day, results: [res]});
                    }

                });
                callback([...days.values()]);
            } else {
                callback([], err);
            }
        });
    }

    convertPlayerToString(player) {
        let playerName = 'No player found';
        let slackName = `@${player.slackID}`;

        if (player.slackCode) {
            slackName = `<@${player.slackCode}>`;
        }

        if (player) {
            playerName = `${util.capitaliseWords(player.country)} (${slackName})`;
        }
        return playerName;
    }

    calculateResultsMessages(score1, score2, difference) {
        let player1Message = '';
        let player2Message = '';

        if (score1 > score2) {
            player1Message = prompts.winMessage[difference];
            player2Message = prompts.loseMessage[difference];
        } else if (score1 < score2) {
            player1Message = prompts.loseMessage[difference];
            player2Message = prompts.winMessage[difference];
        } else {
            let drawMessage1 = Math.floor(Math.random() * prompts.drawMessage.length);
            let drawMessage2 = Math.floor(Math.random() * prompts.drawMessage.length);
            player1Message = prompts.drawMessage[drawMessage1];
            player2Message = prompts.drawMessage[drawMessage2];
        }

        return {player1Message: player1Message, player2Message: player2Message};
    }

    addUsers(users) {
        DAO.getInstance().addUsers(users);
    }

    checkScoreDifference(score1, score2) {
        let difference = Math.abs(score1 - score2);

        return difference;
    }

    addMatches() {
        //group A
        this.addMatch('albania', 'france');
        this.addMatch('albania', 'romania');
        this.addMatch('albania', 'switzerland');
        this.addMatch('france', 'romania');
        this.addMatch('france', 'switzerland');
        this.addMatch('romania', 'switzerland');

        //group B
        this.addMatch('england', 'russia');
        this.addMatch('england', 'slovakia');
        this.addMatch('england', 'wales');
        this.addMatch('russia', 'slovakia');
        this.addMatch('russia', 'wales');
        this.addMatch('slovakia', 'wales');

        //group C
        this.addMatch('germany', 'northern ireland');
        this.addMatch('germany', 'poland');
        this.addMatch('germany', 'ukraine');
        this.addMatch('northern ireland', 'poland');
        this.addMatch('northern ireland', 'ukraine');
        this.addMatch('poland', 'ukraine');

        //group D
        this.addMatch('croatia', 'czech');
        this.addMatch('croatia', 'spain');
        this.addMatch('croatia', 'turkey');
        this.addMatch('czech', 'spain');
        this.addMatch('czech', 'turkey');
        this.addMatch('spain', 'turkey');

        //group E
        this.addMatch('belgium', 'italy', new Date('2016-05-21'));
        this.addMatch('belgium', 'republic of ireland');
        this.addMatch('belgium', 'sweden', new Date('2016-05-19'));
        this.addMatch('italy', 'republic of ireland', new Date('2016-05-19'));
        this.addMatch('italy', 'sweden', new Date('2016-05-20'));
        this.addMatch('republic of ireland', 'sweden', new Date('2016-05-21'));

        //group F
        this.addMatch('austria', 'hungary');
        this.addMatch('austria', 'iceland');
        this.addMatch('austria', 'portugal');
        this.addMatch('hungary', 'iceland');
        this.addMatch('hungary', 'portugal');
        this.addMatch('iceland', 'portugal');

        //group G
        this.addMatch('copeman', 'enclava');
        this.addMatch('copeman', 'sealand');
        this.addMatch('copeman', 'forvik');
        this.addMatch('enclava', 'sealand');
        this.addMatch('enclava', 'forvik');
        this.addMatch('sealand', 'forvik');

        //group H
        this.addMatch('austenasia', 'perloja');
        this.addMatch('austenasia', 'elleore');
        this.addMatch('austenasia', 'frestonia');
        this.addMatch('perloja', 'elleore');
        this.addMatch('perloja', 'frestonia');
        this.addMatch('elleore', 'frestonia');
    }

    //temp method to add scheduled matches
    addMatch(team1, team2, date, matchCode, callback) {
        let bracket = null;
        let match = null;

        if (matchCode) {
            matchCode = matchCode.split(/[rm]/i);

            bracket = parseInt(matchCode[1]);
            match = parseInt(matchCode[2]);
        }

        this.getAllPlayers(function(playerDocs) {

            //add one match
            let team1Doc = util.getPlayerFromArray(team1, playerDocs);
            let team2Doc = util.getPlayerFromArray(team2, playerDocs);
            if (team1Doc.length === 0 ) {
                callback({error: true, message: prompts.player1NotFound, args:{player1: team1}})
            }
            else if(team2Doc.length === 0) {
                callback({error: true, message: prompts.player2NotFound, args:{player2: team2}})
            }
            else {
                DAO.getInstance().addMatch(team1Doc[0]._id, team2Doc[0]._id, date, bracket, match, function(err, added) {
                    let match = {error: true, message: prompts.databaseError};
                    if (!err) {
                        match = {
                            error: false,
                            id: added,
                            t1:util.capitaliseWords(team1Doc[0].country),
                            p1:team1Doc[0].slackID,
                            t2:util.capitaliseWords(team2Doc[0].country),
                            p2:team2Doc[0].slackID,
                            date: moment(date).format('dddd Do MMMM')
                        }
                    }
                    callback(match);

                });
            }

        });

    }

    getMatches(team1, team2, callback) {
        DAO.getInstance().getMatches(team1._id, team2._id, callback);
    }

    getValidMatch(matches) {
        let validMatch = null;
        matches.forEach(function (match, id) {
            if (!match.result) {
                validMatch = match;
            }
        });
        return validMatch;
    }

    getBracketMatches(callback) {
        let testData = {
            prelims: [
                { team1:{country:'Sweden'}, team2:{country:'Italy'}, date: new Date(), result: {score1: 10, score2: 0 }, winner: 1 },
                { team1:{country:'Belgium'}, team2:{country:'Republic Of Ireland'}, date: new Date(), result: {score1: 0, score2: 10 }, winner: 2 },
                { team1:{country:'France'}, team2:{country:'England'}, date: new Date(), result: {score1: 0, score2: 10 }, winner: 2 },
                { team1:{country:'Sealand'}, team2:{country:'Russia'}, date: new Date(), result: {score1: 10, score2: 0 }, winner: 1 },
                { team1:{country:'Sovereign State Of Forvik'}, team2:{country:'Italy'}, date: new Date(), result: {score1: 10, score2: 0 }, winner: 1 },
                { team1:{country:'Belgium'}, team2:{country:'Republic Of Ireland'}, date: new Date(), result: {score1: 0, score2: 10 }, winner: 2 },
                { team1:{country:'France'}, team2:{country:'England'}, date: new Date(), result: {score1: 0, score2: 10 }, winner: 2 },
                { team1:{country:'Sealand'}, team2:{country:'Russia'}, date: new Date(), result: {score1: 10, score2: 0 }, winner: 1 }
            ],

            quaterFinals: [
                { team1:{country:'Sweden'}, team2:{country:'Republic Of Ireland'}, date: new Date(), result: {score1: 6, score2: 2 }, winner: 1 },
                { team1:{country:'England'}, team2:{country:'Sealand'}, date: new Date(), result: {score1: 4, score2: 3 }, winner: 1 },
                { team1:{country:'Sovereign State Of Forvik'}, team2:{country:'Republic Of Ireland'}, date: new Date(), result: {score1: 60, score2: 2 }, winner: 1 },
                { team1:{country:'England'}, team2:{country:'Sealand'}, date: new Date(), result: {score1: 4, score2: 3 }, winner: 1 },
            ],

            semiFinals: [
                { team1:{country:'Sweden'}, team2:{country:'England'}, date: new Date(), result: {score1: 0, score2: 0 }, winner: 0 },
                { team1:{country:'Sovereign State Of Forvik'}, team2:{country:'England'}, date: new Date(), result: {score1: 0, score2: 0 }, winner: 0 },
            ],

            finals: [
                { team1:{country:'Sweden'}, team2:{country:'Sovereign State Of Forvik'}, date: new Date(), result: {score1: 0, score2: 0 }, winner: 0 },
            ]
        };

        DAO.getInstance().getMatches(null, null, function(matches, err) {

            let brackets = {
                prelims: [],
                quaterFinals: [],
                semiFinals: [],
                finals: []
            }

            if (!err) {

                DAO.getInstance().getResultsMap(function(err, results) {

                    if (!err) {

                        matches.forEach(function(match) {

                            if (!match.team1) {
                                match.team1 = {country: 'Team 1'};
                            }

                            if (!match.team2) {
                                match.team2 = {country: 'Team 2'};
                            }

                            if (!match.result) {
                                match.result = {score1: null, score2: null};
                            } else {
                                match.result = results.get(JSON.stringify(match.result));
                                let winner = 0;
                                if (match.result.score1 > match.result.score2) {
                                    winner = 1;
                                } else if (match.result.score1 < match.result.score2) {
                                    winner = 2;
                                }
                                match.winner = winner;
                            }

                            switch(match.stage) {
                                case 16: brackets.prelims.push(match);
                                break;
                                case 8: brackets.quaterFinals.push(match);
                                break;
                                case 4: brackets.semiFinals.push(match);
                                break;
                                case 2: brackets.finals.push(match);
                                break;
                            };

                        });

                        callback(brackets);
                    };
                });
            }

        });
    }

    getTodaysRandomMessages(number, slackBot) {
        for (let i = 0; i < number; i++) {
            let hour = Math.floor(Math.random() * 8) + 9 ;
            hour = hour < 10 ? '0'+hour : hour;
            let minutes = Math.floor(Math.random() * 60);
            minutes = minutes < 10 ? '0'+minutes : minutes;
            let time = `${hour}:${minutes}`;
            remind.at(time, function() {
                let message = "";
                switch(i%3) {
                    case 0:
                    // Jokes
                    message = util.getRandomMessage('jokes');
                    slackBot.sendMessage(mainChannel.code, message);
                    break;
                    case 1:
                    let subject = util.getRandomMessage('giphySubjects');
                    util.getGiphyURL(subject, function(msg) {
                        slackBot.sendMessage(mainChannel.code, msg);
                    })
                    break;
                    case 2:
                    message = util.getRandomMessage('quotes');
                    slackBot.sendMessage(mainChannel.code, message);
                    break;
                }
            }
        )
    }
}


}

module.exports = Controller;
