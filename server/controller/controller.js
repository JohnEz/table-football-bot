'use strict';
const DAO = require('./dao.js');
const prompts = require('../prompts.js')
const MAXSCORE = require('../config').maxScore;
const MAXRESULTS = require('../config').maxResults;
const admins = require('../config').admins;
const moment = require('moment');
const util = require('../util');

class Controller {
    constructor() {

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
                let days = new Map();
                results.forEach(function(result) {
                    let day = moment(result.date).format('DD/MM/YYYY');
                    let res = {
                        id: result._id,
                        winner: util.capitaliseWords(result.winner.country),
                        loser:  util.capitaliseWords(result.loser.country),
                        winScore: result.winnerScore,
                        loseScore: result.loserScore,
                    }

                    if(days.has(day)){
                        days.get(day).results.push(res);
                    }
                    else {
                        days.set(day, {date: day, results: [res]})
                    }

                })
                callback([...days.values()]);
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

    //temp method to add scheduled matches
    addMatches() {

        this.getAllPlayers(function(playerDocs) {

            //add one match
            let team1 = util.getPlayerFromArray('sweden', playerDocs);
            let team2 = util.getPlayerFromArray('italy', playerDocs);

            console.log(team1);

            DAO.getInstance().addMatch(team1[0]._id, team2[0]._id, function(added) {
                console.log('match was added:', added);
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
