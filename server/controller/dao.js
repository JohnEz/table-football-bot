'use strict';
let MongoClient = require('mongodb').MongoClient;
let url = process.env.DATABASE_URL || require('../config').database_url;

let instance = null;
const playersCollection = 'players';
const matchesCollection = 'matches';
const resultsCollection = 'results';

class DAO {
	constructor() {
		this.db = null;
	}

	getInstance() {
		if (!instance) {
			instance = this;
		}
		return instance;
	}

	//allows a callback function and gives parameters for the database and the error
	init(callback) {
		MongoClient.connect(url, { server: { reconnectTries: 100, reconnectInterval: 3000} }, function(err, database) {
			if(!err && database) {
				//if there was no error and we got a database
				this.db = database;
				callback();
			} else {
				console.log(err);
			}
		}.bind(this));
	}

	getPlayer(searchTerm, callback) {
		let collection = this.db.collection(playersCollection);

		//if a search term was entered
		if (searchTerm) {

			collection.findOne( { $or: [ { country : searchTerm }, { slackID : searchTerm }, { slackCode : searchTerm.toUpperCase() } ] }, function(err, doc) {
				//if a document was found
				if (doc) {
					callback(doc);
				} else if (!err) {
					callback(null, 'There was no team by that name');
				} else {
					callback(null, err);
					console.log('error:',err);
				}
			});
		} else {
			callback(null, 'NULL was entered');
		}
	}

	getPlayers(player1, player2, callback) {
		let player1Doc = null;
		let player2Doc = null;

		this.getPlayer(player1, function(p1) {
			player1Doc = p1;

			this.getPlayer(player2, function(p2) {
				player2Doc = p2;

				callback(player1Doc, player2Doc);

			});
		}.bind(this));
	}

	getAllPlayers(callback) {
		let collection = this.db.collection(playersCollection);
		let playersMap = new Map();

		collection.find().each(function(err, doc) {
			if (err) {
				callback(null, err);
				console.log('Error in getAllPlayers:', err);
			} else if (doc) {
				playersMap.set(JSON.stringify(doc._id), doc);
			} else {
				callback(playersMap);
			}
		});
	}

	addResult(player1ID, player2ID, winningScore, losingScore, match, callback) {
		let results = this.db.collection(resultsCollection);
		let matches = this.db.collection(matchesCollection);
		let dateAdded = new Date();
		let resultToAdd = { player1: player1ID, player2: player2ID, score1: winningScore, score2: losingScore, date: dateAdded };

		if (match.stage) {
			resultToAdd = Object.assign({}, resultToAdd, {knockout: true});
		}

		results.insertOne(resultToAdd, function(err, result) {
			if (err) {
				console.log(err);
				callback(!err);
			} else {
				matches.findAndModify(
					{ _id: match._id },
					[['_id', 1]],
					{$set: { result: result.ops[0]._id } },
					function(error, foundMatch) {
						if (error) {
							console.log(error);
						}
						callback(!error);
					}
				);
			}
		});

	}

	getResults(count, player1Doc, player2Doc, callback) {
		let collection = this.db.collection(resultsCollection);
		let resultArray = [];
		let query = {};

		//get the players
		this.getAllPlayers(function(playersMap, err) {

			if (!err) {

				//create the query
				if (player1Doc && player2Doc) {
					query = { $or: [ { player1 : player1Doc._id, player2 : player2Doc._id }, { player1 : player2Doc._id, player2 : player1Doc._id } ] };
				} else if (player1Doc) {
					query = { $or: [ { player1 : player1Doc._id }, { player2 : player1Doc._id } ] };
				}

				let aggregate = count ? [ { $match: query }, {$sort : { date : -1 }}, { $limit : count } ] : [ { $match: query }, {$sort : { date : -1 }} ];

				collection.aggregate( aggregate ).each(function(err, doc) {
					//if there was an error with the database
					if (err) {
						callback(null, err);
						console.log('error', err);
					} else if (doc) {
						//if there is a document, add it
						doc.player1 = playersMap.get(JSON.stringify(doc.player1));
						doc.player2 = playersMap.get(JSON.stringify(doc.player2));

						resultArray.push(doc);
					} else {
						//end of results
						collection.count(function(err, count) {
							callback(resultArray, null, count === resultArray.length);
						});
						return;
					}

				});

			} else {
				callback(null, err);
			}
		});
	}

	isPlayer(slackID, callback) {
		let collection = this.db.collection(playersCollection);

		collection.count({slackID: slackID}, function(err, count) {
			if (err) {
				console.log(err);
			}
			callback(count !== 0);
		});
	}


	addUsers(users) {
		users.forEach(function(user) {
			this.addUser(user);
		}.bind(this));
	}

	addUser(user) {
		let collection = this.db.collection(playersCollection);
		collection.findAndModify(
			{$and: [ {slackID: user.name}, {slackCode: {$exists: false}}]}, //query
			[['slackID', 1]], //sort
			{$set: {slackCode: user.id, fname: user.fname}}, //modify
			function(err, doc) { //callback
				if(err){
					console.error('FindandModifyUserError:',err);
				}
			}
		);
	}

	addMatch(team1ID, team2ID, scheduledDate, bracket, match, callback) {
		let collection = this.db.collection(matchesCollection);
		let query = {$and: [ {stage: 'group'}, {matchNumber: 'x'} ]};

		if (bracket && match) {
			query = {$and: [ {stage: bracket}, {matchNumber: match} ]};
		}

		collection.findAndModify(
			query,
			[['match', 1]],
			{$set : { 'team1': team1ID, 'team2': team2ID, 'date': scheduledDate, 'result': null, stage: bracket, matchNumber: match }},
			{upsert: true, new: true},
			function(err, data) {
				let id = null;
				if (err) {
					console.log(err);
				}

				if (data) {
					id = data.value._id;
				}

				callback(err, id);
			}
		)
	}

	updateKnockoutMatch(stage, matchNumber, teamID, isFirstTeam, callback) {
		let collection = this.db.collection(matchesCollection);
		let set = {$set: { team2: teamID } };

		if (isFirstTeam) {
			set = {$set: { team1: teamID } };
		}

		collection.findAndModify(
			{ stage: stage, matchNumber: matchNumber },
			[['_id', 1]],
			set,
			function(error, foundMatch) {
				if (error) {
					console.log(error);
				}
				callback(!error);
			}
		);
	}

	getMatchesCount(callback) {
		let collection = this.db.collection(matchesCollection);

		collection.count({date: {$ne: null}, result: null}, function(err, count) {
			callback(count);
		});
	}

	getMatches(team1ID, team2ID, callback) {
		let collection = this.db.collection(matchesCollection);
		let matchesMap = new Map();
		let query = {};

		if (team1ID) {
			if(team2ID) {
				query = { $or: [ { team1 : team1ID, team2 : team2ID }, { team1 : team2ID, team2 : team1ID } ] };
			} else {
				query = { $or: [ { team1 : team1ID }, { team2 : team1ID } ] };
			}
		}
		//get the players
		this.getAllPlayers(function(playersMap, err) {
			collection.find(query).each(function(err, doc) {

				if (err) {
					callback(null, err);
					console.log('Error in getMatches:', err);
				} else if (doc) {

					if (playersMap.has(JSON.stringify(doc.team1))) {
						doc.team1 = playersMap.get(JSON.stringify(doc.team1));
					}

					if (playersMap.has(JSON.stringify(doc.team2))) {
						doc.team2 = playersMap.get(JSON.stringify(doc.team2));
					}

					matchesMap.set(JSON.stringify(doc._id), doc);
				} else {
					callback(matchesMap);
				}

			});
		});
	}

}

let _dao = new DAO();

module.exports = _dao;
