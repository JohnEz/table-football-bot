'use strict';
const DAO = require('./dao.js');
const prompts = require('../prompts.js')
const MAXSCORE = 10;

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
        let intScore1 = parseInt(score1);
        let intScore2 = parseInt(score2);

        this.validateInputs(player1, player2, intScore1, intScore2, function(passed, message, player1Doc, player2Doc) {
            //if it passed validation
            if (passed) {
                //atempt to add the results
                DAO.getInstance().addResult(player1Doc._id, player2Doc._id, intScore1, intScore2, function(added) {
                    //if the results were added successfully
                    if (added) {
                        //return the added message
                        callback(prompts.resultCreated);
                    } else {
                        //else there must have been an error with the database
                        //return the defualt database error message
                        callback(prompts.databaseError);
                    }
                });

            } else {
                callback(message);
            }

        });
    }

    getResults(count, player1, player2, callback) {

        //get the documents for the players
        DAO.getInstance().getPlayers(player1, player2, function(player1Doc, player2Doc) {
            //get the results between the players
            DAO.getInstance().getResults(count, player1Doc, player2Doc, function(results, err) {

                if (!err) {

                    results.forEach(function(result) {
                        result.team1 = this.convertPlayerToString(result.team1);
                        result.team2 = this.convertPlayerToString(result.team2);
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
        if (player) {
            playerName = player.country + ' (' + player.slackID + ')';
        }
        return playerName;
    }


}

module.exports = Controller;
