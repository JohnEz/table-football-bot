// list of messages that can be sent back to the user.

module.exports = {
  helpMessage: "Here's what I can do:\n\n" +
  "* Add new results by saying something like 'England beat Germany 10 - 0'\n" +
  "* List the previous results by saying something like 'what where the last results?'\n",
  error: 'D\'oh, something went wrong, try again.',
  resultCreated: "Added a new result: '%(result)s'",
  playerMissing: 'I\'ve got %{player} scored %{s1}, who scored %{s2}?',
  scoreMissing: 'What was the score?',
  listResultsList: 'Results\n%s',
  listResult: '%(result)s\n',
  listNoResult: 'There are no results for that search',
  player1NotFound: '%(player1)s was not found',
  player2NotFound: '%(player2)s was not found',
  sameTeamEntered: 'A team can\'t play against itself',
  incorrectScore: 'Scores should be between 0-',
  noMaxScore: 'One of the scores should be ',
  twoMaxScores: 'Only one score should be ',
  databaseError: 'There was a database error, please contact @amjones',
  notEnoughData: 'Sorry, I didn\'t get that, please post results in the form \"Team A beat Team B 10-x\"',
  thanks: 'Cheers %{user}',
  getFirstTeam:'Sorry who was the first team?',
  getSecondTeam: 'Who was the second team?',
  channelHello: 'Welcome to the thunderdome',
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
      'Congratulations, you beat %(country)s.',
      'Nicely done, you beat %(country)s easily.',
      'Congrats on beating %(country)s 10 - 0.'
  ],
  loseMessage: [
      'Commiserations. %(country)s beat you, but only just.',
      'Sorry to hear %(country)s beat you.',
      'You lost to %(country)s, and quite badly too.  Maybe you need more practice.',
      '10-0. Were you even trying?'
  ],
  result: 'Result just in: \n %(result)s'
}
