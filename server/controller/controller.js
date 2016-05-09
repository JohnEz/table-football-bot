'use strict';
const DAO = require('./dao.js');
const prompts = require('../prompts.js')
const MAXSCORE = 10;

class Controller {
    constructor() {

    }

    getPlayers(player1, player2, callback) {
        let player1ID = null;
        let player2ID = null;

        DAO.getInstance().getPlayerID(player1, function(id1) {
            player1ID = id1;

            DAO.getInstance().getPlayerID(player2, function(id2) {
                player2ID = id2;

                callback(player1ID, player2ID);

            });
        });
    }

    validatePlayers(player1ID, player2ID) {
        let pass = true;
        let errorMessage = '';

        if (player1ID === null) {
            errorMessage = prompts.player1NotFound;
            pass = false;
        } else if (player2ID === null) {
            errorMessage = prompts.player2NotFound;
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

        this.getPlayers(player1, player2, function(player1ID, player2ID) {

            //get the validation results
            let validatePlayersResults = this.validatePlayers(player1ID, player2ID);
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
                callback(true, 'woo', player1ID, player2ID);
            }

        }.bind(this));

    }

    submitResult(player1, player2, score1, score2, callback) {
        let intScore1 = parseInt(score1);
        let intScore2 = parseInt(score2);

        this.validateInputs(player1, player2, intScore1, intScore2, function(passed, message, player1ID, player2ID) {
            //if it passed validation
            if (passed) {
                //atempt to add the results
                DAO.getInstance().addResult(player1ID, player2ID, intScore1, intScore2, function(added) {
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


}

module.exports = Controller;
