'use strict';
const DAO = require('./dao.js');
const prompts = require('../prompts.js')
const MAXSCORE = require('../config').maxScore;
const MAXRESULTS = require('../config').maxResults;
const admins = require('../config').admins;
const util = require('../util');
const Reminder = require('reminder');
const remind = new Reminder();

class Controller {
    constructor() {

    }

    setupReminders(slackBot){
        remind.every('09:00', function(date) {

            console.log('<-- Sending reminders -->');

            this.getMatchesToBePlayed(date, function(matches) {

                matches.today.forEach(function(match) {
                    if (match.team1.slackCode) {
                        let slackName = this.getSlackHandle(match.team2);

                        slackBot.sendMessage(match.team1.slackCode, prompts.matchToday, { country: match.team2.country, slackHandle: slackName });
    				}

                    if (match.team2.slackCode) {
                        let slackName = this.getSlackHandle(match.team1);

                        slackBot.sendMessage(match.team2.slackCode, prompts.matchToday, { country: match.team2.country, slackHandle: slackName });
                    }
                }.bind(this));

                matches.overdue.forEach(function(match) {
                    if (match.team1.slackCode) {
                        let slackName = this.getSlackHandle(match.team2);

                        slackBot.sendMessage(match.team1.slackCode, prompts.matchOverdue, { country: match.team2.country, slackHandle: slackName });
                    }

                    if (match.team2.slackCode) {
                        let slackName = this.getSlackHandle(match.team1);

                        slackBot.sendMessage(match.team2.slackCode, prompts.matchOverdue, { country: match.team2.country, slackHandle: slackName });
                    }
                }.bind(this));

                console.log('<-- Reminders sent -->');

            }.bind(this));
        }.bind(this));
    }

    getMatchesToBePlayed(date, callback) {
        DAO.getInstance().getMatches(null, null, function(matchesMap) {

            let todaysGames = [];
            let overdueGames = [];

            matchesMap.forEach(function(match) {

                //if it has a date set, and no results given
                if (match.date && !match.result) {

                    //check if its meant to be played today
                    if (match.date.getDay() === date.getDay() && match.date.getMonth() === date.getMonth()) {
                        todaysGames.push(match);
                    } else if ( match.date.getMonth() < date.getMonth() || (match.date.getDay() < date.getDay() && match.date.getMonth() === date.getMonth()) ) {
                        // if its not meant to be played today, check if it was last month or earlier this month
                        overdueGames.push(match);
                    }
                }

            });

            callback( { today: todaysGames, overdue: overdueGames } );
        });
    }

    getSlackHandle(player) {
        let slackName = `(@${player.slackID})`;
        if (player.slackCode) {
            slackName = `(<@${player.slackCode}>)`;
        }

        return slackName;
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

            if (score > MAXSCORE || score < 0) {
                errorMessage = prompts.incorrectScore + MAXSCORE;
                pass = false;
            }
        } else {
            pass = false;
        }

        return {passed: pass, message: errorMessage};
    }

    validateScores(score1, score2) {
        let pass = true;
        let errorMessage = '';

        score1 = parseInt(score1);
        score2 = parseInt(score2);

        //check that one value is 10 and only that value is 10
        if (score1 !== MAXSCORE && score2 !== MAXSCORE) {
            errorMessage = prompts.noMaxScore + MAXSCORE;
            pass = false;


        }
        //check that both values are not the maxscore
        else if (score1 === MAXSCORE && score2 === MAXSCORE) {
            errorMessage = prompts.twoMaxScores + MAXSCORE;
            pass = false;
        }

        return {passed: pass, message: errorMessage};
    }

    submitResult(player1, player2, score1, score2, win, loss, match, callback) {

        let intScoreLeft = parseInt(score1);
        let intScoreRight = parseInt(score2);

        //if they said loss OR they didnt specify but the right team had a higher score
        if (loss || (!loss && !win && intScoreRight > intScoreLeft)) {
            //swap the players
            let storePlayer = player2;
            player2 = player1;
            player1 = storePlayer;
        }

        //the winner will be player1 and loser player 2
        //so make sure that the scores reflect that
        if (intScoreRight > intScoreLeft) {
            let storeScore = intScoreRight;
            intScoreRight = intScoreLeft;
            intScoreLeft = storeScore;
        }

        let intScoreWinner = intScoreLeft;
        let intScoreLoser = intScoreRight;

        //atempt to add the results
        DAO.getInstance().addResult(player1._id, player2._id, intScoreWinner, intScoreLoser, match, function(added) {
            //if the results were added successfully
            if (added) {
                let winnerString = this.convertPlayerToString(player1);
                let loserString = this.convertPlayerToString(player2);

                let result = {
                    winner: player1,
                    loser: player2,
                    winnerScore: intScoreWinner,
                    loserScore: intScoreLoser,
                    toString: util.createResultString(winnerString, loserString, intScoreWinner, intScoreLoser)
                }

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
                        result.winner = this.convertPlayerToString(result.winner);
                        result.loser = this.convertPlayerToString(result.loser);
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

            DAO.getInstance().getResults(null, null, null, function(results) {

                players.forEach(function(player) {
                    let thisPlayer = {
                        id: player._id,
                        country: util.capitaliseWords(player.country),
                        slackId: player.slackID,
                        group: player.group,
                        won: 0,
                        lost: 0,
                        for: 0,
                        against: 0
                    };
                    results.forEach(function(result) {
                        if (player._id.equals(result.winner._id)) {
                            thisPlayer.won++;
                            thisPlayer.for += result.winnerScore;
                            thisPlayer.against += result.loserScore;
                        }
                        else if (player._id.equals(result.loser._id)) {
                            thisPlayer.lost++;
                            thisPlayer.for += result.loserScore;
                            thisPlayer.against += result.winnerScore;
                        }
                    });
                    table.push(thisPlayer);
                });
                callback(table);
            });
        });
    }

    getResultsTable(callback) {
        DAO.getInstance().getResults(null, null, null, function(results, err) {
            if (!err) {
                let res = [];
                results.forEach(function(result) {
                    res.push({
                        id: result._id,
                        winner: util.capitaliseWords(result.winner.country),
                        loser:  util.capitaliseWords(result.loser.country),
                        winScore: result.winnerScore,
                        loseScore: result.loserScore
                    })
                });

                callback(res);
            } else {
                callback([], err);
            }
        })
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

    addUsers(users) {
        DAO.getInstance().addUsers(users);
    }

    checkScoreDifference(winnerScore, loserScore) {
        let difference = Math.abs(winnerScore - loserScore);

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
    addMatch(team1, team2, date) {

        this.getAllPlayers(function(playerDocs) {

            //add one match
            let team1Doc = util.getPlayerFromArray(team1, playerDocs);
            let team2Doc = util.getPlayerFromArray(team2, playerDocs);

            DAO.getInstance().addMatch(team1Doc[0]._id, team2Doc[0]._id, date, function(added) {

            });

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

}

module.exports = Controller;
