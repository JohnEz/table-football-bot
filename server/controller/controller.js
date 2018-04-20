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
        remind.every('07:59', function(date) {
            //if its not a weekend
            if (date.getDay() !== 6 && date.getDay() !== 0) {
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
            }
        }.bind(this));
    }

    getMatchesToBePlayed(date, team1, team2, callback) {

        DAO.getInstance().getMatches(team1, team2, function(matchesMap) {

            let todaysGames = [];
            let overdueGames = [];
            let upcomingGames = [];
            let gameFound = false;
            let playedGameFound = false;
            let error = null;

            matchesMap.forEach(function(match) {

                //if it has a date set, and no results given
                if (match.date && !match.result) {

                    let whenToPlay = this.compareMatchDate(date, match);

                    if (!gameFound) {
                        gameFound = true;
                    }

                    //check if its meant to be played today
                    if (whenToPlay === 0) {
                        todaysGames.push(match);
                    } else if ( whenToPlay === -1 ) {
                        // if its not meant to be played today, check if it was last month or earlier this month
                        overdueGames.push(match);
                    } else {
                        upcomingGames.push(match);
                    }
                } else {
                    playedGameFound = true;
                }

            }.bind(this));

            if (!gameFound) {
                if (!playedGameFound) {
                    error = prompts.noGames;
                } else {
                    error = prompts.noGamesToPlay;
                }
            }

            todaysGames.sort(this.sortMatchByDate);
            overdueGames.sort(this.sortMatchByDate);
            upcomingGames.sort(this.sortMatchByDate);
            DAO.getInstance().getMatchesCount(function(count) {
                let totalGames = todaysGames.length + overdueGames.length;
                callback( { today: todaysGames, overdue: overdueGames, atLimit: totalGames === count }, error );
            });

        }.bind(this));
    }

    sortMatchByDate(m1, m2) {
        let val = 0;
        if (m1.date < m2.date) {
            val = -1;
        }
        else if (m1.date > m2.date) {
            val = 1;
        }
        return val;
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

    getMatchesBetween(team1, team2, userId, callback) {

        DAO.getInstance().getAllPlayers(function(players) {
            let team1Docs = util.getPlayerFromArray(team1, players);
            let team2Docs = util.getPlayerFromArray(team2, players);
            let team1Id = null;
            let team2Id = null;
            let includesUser = false;
            let error = null;

            if (team1Docs.length > 1 || team2Docs.length > 1) {
                error = 'Please be more specific with your teams/player';
            } else {
                if (team1Docs.length === 1) {
                    team1 = team1Docs[0];
                    team1Id = team1._id;
                }
                if (team2Docs.length === 1) {
                    team2 = team2Docs[0];
                    team2Id = team2._id;
                }
            }

            if (team1Id && team2Id && team1Id === team2Id) {
                error = 'Hmm, a team cant play against themself so there isn\'t any scheduled games';
            }

            if ((team1 && team1.slackCode === userId) || (team2 && team2.slackCode === userId)) {
                includesUser = true;
            }

            if (!error) {
                this.getMatchesToBePlayed(new Date(), team1Id, team2Id, function(matches, err) {
                    callback(matches, includesUser, err);
                });
            } else {
                callback(null, null, error);
            }

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
        DAO.getInstance().getAllPlayers(function(players) {

            const player1Doc = util.getPlayerFromArray(player1, players)[0];
            const player2Doc = util.getPlayerFromArray(player2, players)[0];

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

    getSummary(slackId, callback) {
        let reply = '';
        // get players/results
        DAO.getInstance().getResults(null, null, null, function(resultArray) {
            // get individual summary eg So far you've played x game and won/lost y of them. In total you've scored z goals and conceded n.
            let personal = {
                fname: '',
                scored: 0,
                conceded: 0,
                won: 0,
                lost: 0,
                draw: 0,
                total: 0
            };
            let player = false;
            resultArray.forEach( function(result) {
                let game = null;
                if (result.player1.slackCode === slackId) {
                    game = result;
                }
                else if (result.player2.slackCode === slackId) {
                    game = {
                        player1: result.player2,
                        player2: result.player1,
                        score1: result.score2,
                        score2: result.score1
                    };
                }
                if (game) {
                    player = true;
                    personal.fname = game.player1.fname;
                    personal.scored += game.score1;
                    personal.conceded += game.score2;

                    if (game.score1 > game.score2) {
                        personal.won++;
                    }
                    else if (game.score1 < game.score2) {
                        personal.lost++;
                    }
                    else {
                        personal.draw++;
                    }
                }

            });

            personal.total = personal.won + personal.lost + personal.draw;
            const pointsPerGame = ((personal.won * 3) + personal.draw) / personal.total;
            const goalDifference = (personal.scored - personal.conceded) / personal.total;
            personal.won = personal.won || 'none';
            personal.scored = personal.scored || 'no';
            personal.conceded = personal.conceded || 'none';

            // general
            let stats = Object.assign({}, util.getStatistics(resultArray), {personal: personal});

            reply = util.getRandomMessage('summaryIntro');
            reply += prompts.totals;

            reply += util.getRandomMessage('stats');

            //personal
            if (player) {

                let statementOne = '';
                let statementTwo = '';

                if (pointsPerGame >= 3) {
                    statementOne = 'you\'ve excelled';
                } else if (pointsPerGame >=2) {
                    statementOne = 'you\'ve done very well';
                } else if (pointsPerGame >=1) {
                    statementOne = 'you\'ve not done too bad';
                } else {
                    statementOne = 'you probably could have done with more practice';
                }

                console.log(goalDifference);

                if (goalDifference >= 4) {
                    statementTwo = 'showed great skill';
                } else if (goalDifference <= -4) {
                    statementTwo = 'were outclassed';
                } else {
                    statementTwo = 'were competitive';
                }

                reply += `\nAs for you, having played ${personal.total} matches, ${statementOne}, winning ${personal.won} of them. You ${statementTwo}, scoring ${personal.scored} goals and conceding ${personal.conceded}`;
            }

            callback(reply, stats);

        });

    }


    getPlayer (searchTerm, callback) {
        DAO.getInstance().getPlayer(searchTerm, callback);
    }

    getAllPlayers(callback) {
        DAO.getInstance().getAllPlayers(function(playersMap) {
            callback([...playersMap.values()]);
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

    isPlayer(slackID, callback) {
        DAO.getInstance().isPlayer(slackID, callback);
    }

    addUsers(users) {
        DAO.getInstance().addUsers(users);
    }

    checkScoreDifference(score1, score2) {
        let difference = Math.abs(score1 - score2);

        return difference;
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
        matches = [...matches.values()].sort(this.sortMatchByDate);
        matches.forEach(function (match, id) {
            if (!match.result && !validMatch) {
                validMatch = match;
            }
        });
        return validMatch;
    }

    randomMessageSetup(slackBot) {
        remind.every('30 minutes', function(date) {
            //if within working hours
            if (util.workingHours(date)) {
                //should I send?
                if (Math.random() < 0.25) {
                    let minutes = Math.floor(Math.random() * 30 * 60000 );
                    setTimeout(function() {
                        this.sendRandomMessage(slackBot);
                    }.bind(this), minutes);
                }
            }
        }.bind(this))
    }

    sendRandomMessage(slackBot) {
        let message = '';
        switch(Math.floor(Math.random() * 4 )) {
            case 0:
            // Jokes
            util.getRandomJoke(function(joke) {
                message = `And now for something completely different...\n\n${joke}`;

                // check it's ok to sendMessage
                let bot = slackBot.getBot();
                let ask = admins[Math.floor(Math.random() * admins.length)];
                bot.startPrivateConversation({user: ask} ,function(err,convo) {

                    convo.ask('Can I say this?\n\n'+joke,[
                        {
                            pattern: bot.utterances.yes,
                            callback: function(response,convo) {
                                convo.say('Great! I will send it out');
                                slackBot.sendMessage(mainChannel.code, message);
                                convo.next();
                            }
                        },
                        {
                            default: true,
                            pattern: bot.utterances.no,
                            callback: function(response,convo) {
                                convo.say('Maybe it\'s a little too racy.');
                                convo.next();
                            }
                        }
                    ]);
                });
            });
            break;
            case 1:
            let subject = util.getRandomMessage('giphySubjects');
            util.getGiphyURL(subject, function(msg) {
                message = `I've spent ages scouring the internet and I think you'll all like this: \n\n${msg}`;
                slackBot.sendMessage(mainChannel.code, msg);
            });
            break;
            case 2:
            message = util.getRandomMessage('quotes');
            message = `>>>"${message}"`;
            slackBot.sendMessage(mainChannel.code, message);
            break;
            case 3:
            util.getNews(function(msg) {
                if (msg.length > 0) {
                    slackBot.sendMessage(mainChannel.code, msg);
                }
            });
        }
    }


    calculateKnockoutMatch(match, result) {
        //find out if it was a knockout game that wasn't the final
        if (match.stage && match.stage > 2) {

            let winningTeam = match.team1._id;
            let isFirstTeam = false;

            //work out where the winner goes
            let targetStage = match.stage / 2;
            let targetMatchNumber = Math.ceil(match.matchNumber / 2);

            //if it was an odd match, the winner is the first team in the next round
            if (match.matchNumber % 2 === 1) {
                isFirstTeam = true;
            }

            //work out which team won
            if (result.score1 < result.score2) {
                winningTeam = match.team2._id;
            }

            DAO.getInstance().updateKnockoutMatch(targetStage, targetMatchNumber, winningTeam, isFirstTeam, function(updated) {

            });

        }
    }

}

module.exports = Controller;
