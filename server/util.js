'use strict';
const prompt = require('./prompts')

let capWords = function(s) {
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
}

module.exports = {
    getRandomMessage(comment) {
        let msg = prompt[comment];
        if (typeof msg === 'string'){
            return msg
        }
        return msg[Math.floor(Math.random()*msg.length)];
    },

    capitaliseWords: function(s) {
        return capWords(s);
    },

    createResultString: function(winner, loser, winnerScore, loserScore) {
        return `${winner} beat ${loser} ${winnerScore}-${loserScore}`;
    },

    isMe: function(name) {
        if (!name) return false;
        let me = ['i', 'me', 'my', 'myself'];
        return me.indexOf(name.toLowerCase()) !== -1;
    }
};
