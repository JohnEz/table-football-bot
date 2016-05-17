// list of messages that can be sent back to the user.

module.exports = {
    helpMessage: "Here's what I can do:\n\n" +
    "* Add new results by saying something like 'England beat Germany 10 - 0'\n" +
    "* List the previous results by saying something like 'what where the last results?'\n" +
    "* Ask who the player or country is by saying 'who is Germany?\n",
    error: 'D\'oh, something went wrong, try again.',
    resultCreated: "Added a new result: '%(result)s'",
    listResultsList: 'Results\n%s',
    listNoResult: 'There are no results for that search',
    player1NotFound: '%(player1)s was not found',
    player2NotFound: '%(player2)s was not found',
    sameTeamEntered: 'A team can\'t play against itself',
    notOwner: 'Only people that played in the game can add results',
    incorrectScore: 'Scores should be between 0-',
    noMaxScore: 'One of the scores should be ',
    twoMaxScores: 'Only one score should be ',
    databaseError: 'There was a database error, please contact @amjones',
    getFirstTeam:'Sorry who was the first team?',
    getSecondTeam: 'Who was the second team?',
    defaultReply: 'You what? I\'m not going to pass the Turing test at this rate am I!',
    hello: [
        'Welcome to the Thunderdome',
        'Howdy',
        'Greetings',
        'Wotcha',
        'Hello'
    ],
    winMessage: [
        'Well done beating %(country)s, that was a close game.',
        'Congratulations, on your win against %(country)s.',
        'Nicely done, you beat %(country)s easily.',
        'Congratulations on your mightily impressive win against %(country)s 10 - 0.'
    ],
    loseMessage: [
        'Commiserations. %(country)s beat you, but only just.',
        'Sorry to hear %(country)s beat you.',
        'You lost to %(country)s, and quite badly too.  Maybe you need more practice.',
        '10-0. Were you even trying?'
    ],
    result: 'Result just in: \n %(result)s'
}
