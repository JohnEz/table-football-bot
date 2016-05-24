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
    confirmPlayer1: 'Can you confirm the first player?',
    confirmPlayer2: 'Did you mean one of these for the second player?',
    player1NotFound: '%(player1)s was not found',
    player2NotFound: '%(player2)s was not found',
    tooManyPlayersFound: 'Please try to be more specific with your player names',
    sameTeamEntered: 'A team can\'t play against itself',
    noMatchFound: 'There are no scheduled matches between these teams',
    allMatchesHaveResults: 'All matches between these teams already have results',
    notOwner: 'Only people that played in the game can add results',
    negativeScore: 'Scores should be greater than 0',
    shouldHaveSameScore: 'If the game was a draw, the scores should be the same',
    cannotBeEqualScores: 'If someone won the game, one score must be higher than the other',
    twoMaxScores: 'Only one score should be ',
    databaseError: 'There was a database error, please contact @amjones',
    getFirstTeam:'Sorry who was the first team?',
    getSecondTeam: 'Who was the second team?',
    noGames: 'erm... you have played all your games',
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
        'Congratulations on your mightily impressive win against %(country)s'
    ],
    loseMessage: [
        'Commiserations. %(country)s beat you, but only just.',
        'Sorry to hear %(country)s beat you.',
        'You lost to %(country)s, and quite badly too. Maybe you need more practice.',
        'Were you even trying against %(country)s?'
    ],
    drawMessage: [
        'When you play cards or any other game, there\'s always a winner and a loser. We should have the courage to introduce a final decision in every game of football, but for now, well done on your draw with %(country)s.',
        'A draw against %(country)s, how boring.',
        'You drew with %(country)s. You should have done a penalty shoot out to decide a winner. We don\'t want boring games.',
        'A draw with %(country)s? I guess you aren\'t a top team, you went for the safe option.'
    ],
    result: 'Result just in: \n %(result)s',
    matchToday: 'You have a match against %(opponent)s scheduled for today',
    matchOverdue: 'You have a match against %(opponent)s that is overdue'
}
