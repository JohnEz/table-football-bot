'use strict';
const DAO = require('./dao.js');
const prompts = require('../prompts.js')
const MAXSCORE = require('../config').maxScore;
const MAXRESULTS = require('../config').maxResults;
const admins = require('../config').admins;
const createResultString = require('../util').createResultString;
const capitaliseWords = require('../util').capitaliseWords;

class Controller {
    constructor() {

    }

    validatePlayers(player1Doc, player2Doc, myID) {
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

    submitResult(player1, player2, score1, score2, win, loss, callback) {

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
        DAO.getInstance().addResult(player1._id, player2._id, intScoreWinner, intScoreLoser, function(added) {
            //if the results were added successfully
            if (added) {
                let winnerString = this.convertPlayerToString(player1);
                let loserString = this.convertPlayerToString(player2);

                let result = {
                    winner: player1,
                    loser: player2,
                    winnerScore: intScoreWinner,
                    loserScore: intScoreLoser,
                    toString: createResultString(winnerString, loserString, intScoreWinner, intScoreLoser)
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
        DAO.getInstance().getAllPlayers(function(allPlayers) {
            let players = allPlayers
            DAO.getInstance().getResults(null, null, null, function(allResults) {
                let results = allResults;
                players.forEach(function(player) {
                    let thisPlayer = {
                        id: player._id,
                        country: capitaliseWords(player.country),
                        slackId: player.slackID,
                        won: 0,
                        lost: 0,
                        for: 0,
                        against: 0
                    };
                    results.forEach(function(result) {
                        if (player._id.equals(result.winner._id)) {
                            thisPlayer.won ++;
                            thisPlayer.for += result.winnerScore;
                            thisPlayer.against += result.loserScore;
                        }
                        else if (player._id.equals(result.loser._id)) {
                            thisPlayer.lost ++;
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
                        winner: capitaliseWords(result.winner.country),
                        loser:  capitaliseWords(result.loser.country),
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
            playerName = `${capitaliseWords(player.country)} (${slackName})`;
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


}

module.exports = Controller;
