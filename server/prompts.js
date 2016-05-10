
module.exports = {
  helpMessage: "Here's what I can do:\n\n" +
  "* Add new results by saying something like 'the result of England vs Germany was 10 - 0'\n" +
  "* List the previous results by saying something like 'what where the last results?'\n" +
  "* Remove an incorrect result by saying something like 'remove the game between England and Peru'",
  error: 'D\'oh, something went wrong, try again.',
  resultCreated: "Added a new result: '%(result)s'",
  playerMissing: 'Who was playing?',
  scoreMissing: 'What was the score?',
  listResultsList: 'Results\n%s',
  listResult: '%(result)s\n',
  listNoResult: 'You have no tasks.',
  player1NotFound: 'Player 1 was not found',
  player2NotFound: 'Player 2 was not found',
  incorrectScore: 'Scores should be between 0-',
  noMaxScore: 'One of the scores should be ',
  twoMaxScores: 'Only one score should be ',
  databaseError: 'There was a database error, please contact @amjones',
}
