'use strict';

const request = require('request');
const prompts = require('./prompts');
const moment = require('moment');

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
    nineteen: 19,
    twenty: 20
};

let capWords = s => {
    return s.toLowerCase().replace(/\b./g, a => {
        return a.toUpperCase();
    });
};

module.exports = {
    getRandomMessage(comment) {
        let msg = prompts[comment];
        if (typeof msg === 'string') {
            return msg;
        }
        return msg[Math.floor(Math.random() * msg.length)];
    },

    capitaliseWords: s => {
        return capWords(s);
    },

    createResultString: (player1, player2, score1, score2) => {

        let resultMod = 'beat';

        if (score1 < score2) {
            resultMod = 'lost to';
        } else if (score1 === score2) {
            resultMod = 'drew with';
        }

        return `${player1} ${resultMod} ${player2} ${score1}-${score2}`;
    },

    isMe: name => {
        if (!name)
        return false;
        let me = ['i', 'me', 'my', 'myself'];
        return me.indexOf(name.toLowerCase()) !== -1;
    },

    getPlayerFromArray: (searchTerm, array) => {
        let playersFound = [];

        if (searchTerm && searchTerm !== '') {
            array.forEach(document => {
                if (document.country.indexOf(searchTerm) > -1 || document.slackID === searchTerm || document.slackCode === searchTerm.toUpperCase()) {
                    playersFound.push(document);
                }
            });
        }

        return playersFound;
    },

    convertWordToNumber(word) {
        if (isNaN(parseInt(word, 10))) {
            if (numbers.hasOwnProperty(word)) {
                return numbers[word.toLowerCase()];
            }
            return null;
        } else {
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
            if (today.getDate() > parts[2]) {
                parts[1] = (today.getMonth() + 1) % 12; // to account for December
            } else {
                parts[1] = today.getMonth();
            }
        } else {
            parts[1] = parseInt(parts[1]) - 1; // so month is 0 - 11
        }

        // parse year
        if (parts[0] === 'XXXX') {
            if (today.getMonth() > parts[1] || today.getMonth() === parts[1] && today.getDate() > parts[2]) {
                parts[0] = today.getFullYear() + 1;
            } else {
                parts[0] = today.getFullYear();
            }
        } else {
            parts[0] = parseInt(parts[0]);
        }

        return new Date(...parts);
    },

    workingHours(date) {
        let work = false;
        if (date instanceof Date) {
            work = (
                date.getDay() !== 6 && // not saturday
                date.getDay() !== 0 && // not sunday
                date.getHours() >= 8 && // between 9 and 4 (server is 1 hour behind)
                date.getHours() <= 15);
        }
        return work;
    },

    getGiphyURL(subject, callback) {
        let url = `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${subject.replace(' ', '+')}`;
        request(url, (err, resp, body) => {
            if (!err) {
                let data = JSON.parse(body).data;
                callback(`http://i.giphy.com/${data.id}.${data.type}`);
            } else
            (callback('http://giphy.com/gifs/sepp-blatter-kG7hYpTT4ItSU/200_d.gif'));
        });
    },

    getRandomJoke(callback) {
        let url = `http://www.goodbadjokes.com/jokes/${Math.floor(Math.random()*260)}`;

        request(url, (err, resp, body) => {
            if (!err) {
                let main = /<span class="joke-content">(.*?)<\/span>/.exec(body);
                let joke = '';
                if (main && main.length > 1) {
                    joke = main[1];
                    joke = joke.replace(/<br>|<br\/>|<\/.*?><.*?>/g,'\n');
                    joke = joke.replace(/<.*?>/g,'');
                }
                else {
                    joke = this.getRandomMessage('jokes');
                }

                callback(joke);
            }
            else {
                callback(this.getRandomMessage('jokes'));
            }
        });
    },

    getNews(callback) {
        let rss = [
            'https://www.theguardian.com/football/euro-2016/rss',
            'http://www.dailymail.co.uk/sport/euro2016/index.rss',
            'https://www.thesun.co.uk/sport/football/euro-2016/feed/',
            'http://www.independent.co.uk/sport/football/rss'
        ];
        let site = rss[Math.floor(Math.random() * rss.length)];
        request(site, (err, resp, body) => {
            if (!err  && resp.statusCode == 200) {
                let newsURLs = [];
                let regex = /<item>[\s\S]*?<link>[\s]*?(http.*?euro.*?)[\s]*?<\/link>[\s\S]*?<\/item>/igm;
                let match;
                while (newsURLs.length < 6 && (match = regex.exec(body)) !== null) {
                    newsURLs.push(match[1]);
                }
                let message = '';
                if(newsURLs.length > 0) {
                    message = this.getRandomMessage('newsIntro') + newsURLs[Math.floor(Math.random() * newsURLs.length)];
                }
                callback(message);
            }
            else {
                callback('');
            }
        });
    },

    getStatistics(results) {
        let highestTotalGoals = {
            highestGoals: -1,
            secondHighest: -2,
            player1: '',
            player2: '',
        };

        let lowestTotalGoals = {
            lowestGoals: -1,
            player1: '',
            player2: '',
        };

        let greatestGoalDifference = {
            difference: -1,
            winner: '',
            loser: ''
        };

        let highestNilMatch = {
            score: -1,
            winner: '',
            loser: ''
        };

        let totalGoalsScored = 0;
        let totalGamesPlayed = 0;
        results.forEach(result => {
            const combinedScore = result.score1 + result.score2;
            const difference = Math.abs(result.score1 - result.score2);
            totalGoalsScored += combinedScore;
            totalGamesPlayed++;

            //highest goals scored in a single game
            if (combinedScore > highestTotalGoals.highestGoals) {
                highestTotalGoals.secondHighest = highestTotalGoals.highestGoals;
                highestTotalGoals.highestGoals = combinedScore;
                highestTotalGoals.player1 = result.player1;
                highestTotalGoals.player2 = result.player2;
            } else if (combinedScore > highestTotalGoals.secondHighest) {
                highestTotalGoals.secondHighest = combinedScore;
            }

            //lowest goals scored in a single game
            if (lowestTotalGoals.lowestGoals === -1 || combinedScore < lowestTotalGoals.lowestGoals) {
                lowestTotalGoals.lowestGoals = combinedScore;
                lowestTotalGoals.player1 = result.player1;
                lowestTotalGoals.player2 = result.player2;
            }

            //greatest goal difference
            if (difference > greatestGoalDifference.difference) {
                greatestGoalDifference.difference = difference;
                if (result.score1 > result.score2) {
                    greatestGoalDifference.winner = result.player1;
                    greatestGoalDifference.loser = result.player2;
                } else {
                    greatestGoalDifference.winner = result.player2;
                    greatestGoalDifference.loser = result.player1;
                }
            }

            // highest nil match
            if (result.score2 === 0 && result.score1 > highestNilMatch.score) {
                highestNilMatch.score = result.score1;
                highestNilMatch.winner = result.player1;
                highestNilMatch.loser = result.player2;
            } else if (result.score1 === 0 && result.score2 > highestNilMatch.score) {
                highestNilMatch.score = result.score2;
                highestNilMatch.winner = result.player2;
                highestNilMatch.loser = result.player1;
            }

        });

        const totalMinutesSpent = totalGamesPlayed * 4;
        return {
            highestTotalGoals: highestTotalGoals,
            lowestTotalGoals: lowestTotalGoals,
            greatestGoalDifference: greatestGoalDifference,
            highestNilMatch: highestNilMatch,
            totals: {
                goalsScored: totalGoalsScored,
                gamesPlayed: totalGamesPlayed,
                minutesSpent: moment.duration(totalMinutesSpent, 'minutes').humanize()
            }
        };
    }

};
