'use strict';

let capWords = function(s) {
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
}

module.exports = {
    capitaliseWords: function(s) {
        return capWords(s);
    },

    createResultString: function(winner, loser, winnerScore, loserScore) {
        return `${winner} beat ${loser} ${winnerScore}-${loserScore}`;
    }
};
