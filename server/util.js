'use strict';
const prompts = require('./prompts')

let numbers = {
    nil: 0,
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen:19,
    twenty: 20
}

let capWords = function(s) {
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
}

module.exports = {
    getRandomMessage(comment) {
        let msg = prompts[comment];
        if (typeof msg === 'string'){
            return msg
        }
        return msg[Math.floor(Math.random()*msg.length)];
    },

    capitaliseWords: function(s) {
        return capWords(s);
    },

    createResultString: function(player1, player2, score1, score2) {

        let resultMod = 'beat';

        if (score1 < score2) {
            resultMod = 'lost to';
        } else if (score1 === score2) {
            resultMod = 'drew with';
        }

        return `${player1} ${resultMod} ${player2} ${score1}-${score2}`;
    },

    isMe: function(name) {
        if (!name) return false;
        let me = ['i', 'me', 'my', 'myself'];
        return me.indexOf(name.toLowerCase()) !== -1;
    },

    getPlayerFromArray: function(searchTerm, array) {
        let playersFound = [];

        if (searchTerm && searchTerm !== '') {
            array.forEach(function(document) {
                if (document.country.indexOf(searchTerm) > -1 || document.slackID === searchTerm || document.slackCode === searchTerm.toUpperCase()) {
                    playersFound.push(document);
                }
            });
        }

        return playersFound;
    },

    convertWordToNumber(word) {
        if (isNaN(parseInt(word, 10))) {
            if(numbers.hasOwnProperty(word)) {
                return numbers[word.toLowerCase()];
            }
            return null;
        }
        else {
            return parseInt(word, 10);
        }
    },

    parseLuisDate(date, refDate) {
        /* remember getMonth returns 0 - 11  */

        let today = refDate || new Date();

        let parts = date.split('-');

        //parse day
        parts[2] = parseInt(parts[2]);

        // parse month
        if (parts[1] === 'XX') {
            if (today.getDate() > parts[2] ) {
                parts[1] = (today.getMonth() + 1 ) % 12; // to account for December
            }
            else {
                parts[1] = today.getMonth();
            }
        }
        else {
            parts[1] = parseInt(parts[1]) - 1; // so month is 0 - 11
        }

        // parse year
        if (parts[0] === 'XXXX') {
            if (
                today.getMonth() > parts[1]  ||
                today.getMonth() === parts[1]  && today.getDate() > parts[2]) {
                    parts[0] = today.getFullYear() + 1;
                }
                else {
                    parts[0] = today.getFullYear();
                }
            }
            else {
                parts[0] = parseInt(parts[0]);
            }

            return new Date(...parts)
        }
    };
