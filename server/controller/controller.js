'use strict';
const DAO = require('./dao.js');
const prompts = require('../prompts.js')
const MAXSCORE = require('../config').maxScore;
const MAXRESULTS = require('../config').maxResults;
const createResultString = require('../util').createResultString;
const capitaliseWords = require('../util').capitaliseWords;

class Controller {
    constructor() {

    }

    validatePlayers(player1Doc, player2Doc) {
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
        }

        return {passed: pass, message: errorMessage};
    }

    validateScores(score1, score2) {
        let pass = true;
        let errorMessage = '';

        //check the values arent above the max value
        if (!(score1 >= 0 && score1 <= MAXSCORE && score2 >= 0 && score2 <= MAXSCORE)) {
            errorMessage = prompts.incorrectScore + MAXSCORE;
            pass = false;
        }
        //check that one value is 10 and only that value is 10
        else if (score1 !== MAXSCORE && score2 !== MAXSCORE) {
            errorMessage = prompts.noMaxScore + MAXSCORE;
            pass = false;
        }
        //check that both values are not the maxscore
        else if (score1 === MAXSCORE && score2 === MAXSCORE) {
            cerrorMessage = prompts.twoMaxScores + MAXSCORE;
            pass = false;
        }

        return {passed: pass, message: errorMessage};
    }

    validateInputs(player1, player2, score1, score2, callback) {

        DAO.getInstance().getPlayers(player1, player2, function(player1Doc, player2Doc) {

            //get the validation results
            let validatePlayersResults = this.validatePlayers(player1Doc, player2Doc);
            let validateScoreResults = this.validateScores(score1, score2);

            //if the players dont pass validation
            if (!validatePlayersResults.passed) {
                //return false and the error message
                callback(false, validatePlayersResults.message);
            } else if (!validateScoreResults.passed) {
                //else if the scores dont pass validation
                //return false and the error message
                callback(false, validateScoreResults.message);
            } else {
                //else return true
                callback(true, 'woo', player1Doc, player2Doc);
            }

        }.bind(this));

    }

    submitResult(player1, player2, score1, score2, callback) {
        let intScoreWinner = parseInt(score1);
        let intScoreLoser = parseInt(score2);

        //check if player 2 is the winner
        if (intScoreLoser > intScoreWinner) {
            //if player 2 is the winner, swap the inputs
            let storeScore = intScoreLoser;
            let storePlayer = player2;

            intScoreLoser = intScoreWinner;
            intScoreWinner = storeScore;

            player2 = player1;
            player1 = storePlayer;

        }

        this.validateInputs(player1, player2, intScoreWinner, intScoreLoser, function(passed, message, player1Doc, player2Doc) {
            //if it passed validation
            if (passed) {
                //atempt to add the results
                DAO.getInstance().addResult(player1Doc._id, player2Doc._id, intScoreWinner, intScoreLoser, function(added) {
                    //if the results were added successfully
                    if (added) {
                        let winnerString = this.convertPlayerToString(player1Doc);
                        let loserString = this.convertPlayerToString(player2Doc);

                        let result = {
                            winner: player1Doc,
                            loser: player2Doc,
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

            } else {
                callback(message);
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
        let difference = Math.abs(winnerScore - loserScore) / MAXSCORE;

        return difference;
    }


}

module.exports = Controller;
