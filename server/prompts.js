// list of messages that can be sent back to the user.

module.exports = {
    helpMessage:
    `Here's what I can do:\n
    • Add new results by saying something like:
       "England 10 Germany 0"
       "Sweden lost to Italy ten nil"
       "I beat Northern Ireland 15 1"\n
    • List previous results by saying something like:
       "what were the last results?"
       "show me Croatia's last 2 results"\n
    • Ask who the player or country is by saying:
       "who is Germany?"
       "which country does @someName play as?"\n
    • Ask what your upcoming games are by saying something like:
       "when am I playing next?"\n
    To see the group tables, upcoming matches and results visit http://sl-foosball.herokuapp.com/`,
    error: 'D\'oh, something went wrong, try again.',
    resultCreated: "Added a new result: '%(result)s'",
    listResultsList: 'Results\n%s',
    listNoResult: 'There are no results for that search',
    confirmPlayer1: 'Can you confirm the first player?',
    confirmPlayer2: 'Did you mean one of these for the second player?',
    player1NotFound: '%(player1)s was not found',
    player2NotFound: '%(player2)s was not found',
    playerNotFound: 'I can\'t find that person they don\'t seem to be within my sphere of influence!',
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
    notInLeague: 'Sorry I don\'t know who you are :/',
    noGames: 'erm... you have played all your games',
    cannotAddResults: 'The football gods have decreed that it is not time for submitting results yet',
    defaultReply: 'You what? I\'m not going to pass the Turing test at this rate am I!',
    hello: [
        'Welcome to the Thunderdome',
        'Howdy',
        'Greetings',
        'Wotcha',
        'Hello'
    ],
    greetingReply: [
        'Hello back at you',
        'Grüß Gött',
        'Ciao',
        'Alles klar?',
        'Hi there',
        'Today is a good day for baksheesh. Hint... Hint...',
        'I may be all powerful but I still have time to say "hello" to the little people. \n_Hello little person!_',
        'Hello, I am the v1 BlatterBot, currently powered by Cyberdyne Systems - for a brighter future :wink:',
        'Bonjour'
    ],
    replyToThank: [
        'You\'re welcome!',
        'You are welcome %(player)s.',
        'No problem at all.',
        'It was my pleasure.',
        'Don\'t mention it %(player)s.',
        'No worries %(player)s.',
        'It was nothing',
        'I\'m always happy to help %(player)s, especially after such a generous donation.',
        'Anytime.',
        'Il n’y a pas de quoi.',
        'Bitte schön %(player)s.',
        'Don\'t mention it, but a nice donation is normally custom.',
        'It\'s cool brah'
    ],
    personalHello: {
        dmcavelia: '<@U0TD1CX43>: you must have a foot like a traction engine!',
        jameshill: 'Hi James! You know they wrote me in Delphi? #whatever #bantz #hilarz #delphi #hashtag',
        alisd23: 'Ali, welcome. No walking out when you\'re 9-0 down OK?',
        dkerr: 'Parties over everyone. Dean\'s here now.',
        jleftley: 'Achtung, die Deutschen kamen . Willkommen James.',
        dmiley: 'Welcome Drew, and remember; no ball hogging.',
        jhodges: 'Welcome to the arena Jonathan "10-0" Hodgson! … I mean Hodges!',
        morchard: 'Orchard, just Roper to beat.',
        cprice: 'Who invited Chris Price?',
        rmcneill: 'Top o\' the morning to you Rob!',
        rnewsome: 'Oh, it’s Rob… are you not barred after last year\'s cheating?',
        sjob: 'Добро пожаловать Стив.',
        alison22: 'Och aye, it\'s Alison!',
        rpilling: 'The man, the legend. Robert Pilling.',
        sburnstone: 'Ah the Swiss delegate arrives. The money is all safe yeah?',
        mrapolk: 'Mr Polkinghorn , mae mor dda y gallech ymuno â ni!',
        joelmagee: 'Welcome <Perilous> JGMaster!',
        jamiemorris: 'Hey, #1 guardian reader Jamie Morris',
        jarnstein: 'Jack! The octogenarian vegetarian. Welcome.',
        amjones: 'Safe fam!'
    },
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
    matchOverdue: 'You have a match against %(opponent)s that is overdue',
    scheduleSuccess: 'I\'ve just scheduled %(t1)s (@%(p1)s) vs %(t2)s (@%(p2)s) to be played on %(date)s.\nThe match ID is %(id)s',
    missingPlayer: 'One of the teams wasn\'t found. Bear in mind I\'m only looking for the 32 countries in the tournament and not some fanciful made-up nations!',
    notAdmin: 'You aren\'t an admin. You\'re not allowed to %(intent)s so I\' not listening to you! \n %(url)s',
    cantParseDate: 'Sorry I didn\'t understand the date please try again',
    quotes: [
        "To say that today is a good day for me or for Fifa, this would be totally wrong.",
        "I am really sorry. I am sorry that I am still a punching ball. I am as president of Fifa this punching ball. And I am sorry for football. I am sorry to Fifa.",
        "I have never lost my mind.",
        "I'm not the cleverest man in the world, but like they say in French: Je ne suis pas un imbecile.",
        "What was wrong with me is at the end of the World Cup in Brazil I should have stopped.",
        "Fifa is still working well.",
        "I am the president now, the president of everybody.",
        "I take the responsibility to bring back Fifa where it should be... Let's go Fifa! Let's go Fifa!",
        "Let the women play in more feminine clothes like they do in volleyball. They could, for example, have tighter shorts.",
        "Female players are pretty, if you excuse me for saying so, and they already have some different rules to men - such as playing with a lighter ball.",
        "I could understand it if it had happened in Africa, but not in Italy.",
        "Say something, ladies. You are always speaking at home, now you can speak here.",
        "They want to get rid of me. All this opposition is coming now, it's unfortunate to say it. It's coming from Nyon, from Uefa. They don't have the courage to come in. So let me go on - be respectful!",
        "Women's football is definitely my baby. I consider myself, a little bit, as the godfather of women's football in Fifa.",
        "I am a mountain goat that keeps going and going and going, I cannot be stopped, I just keep going.",
        "I'm not going to use the word coincidence, but I do have a small question mark.",
        "I forgive everyone but I don't forget. We cannot live without Uefa and Uefa cannot live without us.",
        "Football is a simple game; 22 men chase a ball for 90 minutes and at the end, the Germans win. [Gary Lineker]",
        "You can’t say my team aren’t winners. They’ve proved that by finishing fourth, third and second in the last three years. [Gerard Houllier]",
        "Some people believe football is a matter of life and death. I’m very disappointed with that attitude. I can assure you it is much, much more important than that. [Bill Shankly]",
        "There is no in between - you’re either good or bad. We were in between. [Gary Lineker]",
        "I would not be bothered if we lost every game as long as we won the league. [Mark Viduka]",
        "We must have had 99 percent of the game. It was the other three percent that cost us the match. [Ruud Gullit]",
        "I’m as happy as I can be, but I’ve been happier. [Ugo Ehiogu]",
        "We didn’t underestimate them. They were just a lot better than we thought. [Bobby Robson]",
        "I think in England you eat too much sugar and meat and not enough vegetables. [Arsene Wenger]",
        "Please don’t call me arrogant, but I’m European champion and I think I’m a special one. [Jose Mourinho]",
        "The rules of soccer are very simple, basically it is this: if it moves, kick it. If it doesn't move, kick it until it does. [Phil Woosnam]"
    ],
    jokes: [
        "Why did the cookie cry? \nBecause his mother was a wafer so long!",
        "What did the shoes say to the pants?\nSUP, BRITCHES!",
        "Always trust people who like big butts.\nThey cannot lie.",
        "What would bears be without bees?\nEars!",
        "A man goes into the hospital with 6 plastic horses up his bum.\nThe doctors described his condition as stable.",
        "Why didn't the terminator upgrade to windows 10?\nI asked him and he said, \"I still love vista, baby!\"",
        "How did Darth Vader know what Luke got him for Christmas?\nHe felt his presents!",
        "What's red and bad for your teeth?\nA brick",
        "What did the fisherman say to the card magician?\nPick a cod, any cod!",
        "Two antennas met on a roof, fell in love and got married. The Ceremony wasn't much, but the reception was excellent.",
        "A man walks into a bar with a slab of asphalt under his arm and says: \"A beer please, and one for the road.\"",
        "Two cannibals are eating a clown. One says to the other: \"Does this taste funny to you?\"",
        "For the right price, anyone could host the 2022 World Cup",
        "I may be corrupt but I have a soft side.\n http://i.telegraph.co.uk/multimedia/archive/02830/cat_2830677b.jpg",
        "http://dreamatico.com/data_images/kitten/kitten-1.jpg",
        "http://superstrongnana.com/wp-content/uploads/2016/01/playful-kitten-6683.jpg",
        "https://i.ytimg.com/vi/RbwM9CRVhaM/maxresdefault.jpg",
        "http://inspire.cdnimages.in/cute-kittens-and-puppies/cute-baby-kittens-and-puppies-sleeping-animal-box-picture-cackdpe9.jpg",
        "Just for James Walker http://3.bp.blogspot.com/_57kf9wZjVUs/S_GsZvqlNZI/AAAAAAAAAAM/rWg0q_l-rjI/s1600/Pigeon2.jpg"
    ],
    giphySubjects: [
        "Sepp Blatter",
        "Fifa",
        "Fifa Corrupt",
        "Soccer Funny",
        "UEFA",
        "Money",
        "Bribe"
    ]
};
