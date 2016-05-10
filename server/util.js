'use strict';

module.exports.capitaliseWords = function(s) {
    return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
};
