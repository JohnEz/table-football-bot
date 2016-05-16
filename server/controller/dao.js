'use strict';
let MongoClient = require('mongodb').MongoClient;
let url = process.env.DATABASE_URL || require('../config').database_url;

let instance = null;
const playersCollection = 'players';
const scoresCollection = 'matches';

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
		MongoClient.connect(url, function(err, database) {
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

	addResult(winnerID, loserID, winningScore, losingScore, callback) {
		let collection = this.db.collection(scoresCollection);
		let dateAdded = new Date();

		collection.insertOne( { winner: winnerID, loser: loserID, winnerScore: winningScore, loserScore: losingScore, date: dateAdded }, function(err) {
			if (err) {
				console.log(err);
			}
			callback(!err);
		});

	}

	getResults(count, player1Doc, player2Doc, callback) {
		let collection = this.db.collection(scoresCollection);
		let resultArray = [];
		let query = {};

		//get the players
		this.getAllPlayers(function(playersMap, err) {

			if (!err) {

				//create the query
				if (player1Doc && player2Doc) {
					query = { $or: [ { winner : player1Doc._id, loser : player2Doc._id }, { winner : player2Doc._id, loser : player1Doc._id } ] };
				} else if (player1Doc) {
					query = { $or: [ { winner : player1Doc._id }, { loser : player1Doc._id } ] };
				}

				collection.aggregate( [ { $match: query }, {$sort : { date : -1 }}, { $limit : count } ] ).each(function(err, doc) {
					//if there was an error with the database
					if (err) {
						callback(null, err)
						console.log('error', err);
					} else if (doc) {
						//if there is a document, add it
						doc.winner = playersMap.get(JSON.stringify(doc.winner));
						doc.loser = playersMap.get(JSON.stringify(doc.loser));

						resultArray.push(doc);
					} else {
						//end of results
						callback(resultArray);
						return;
					}

				});

			} else {
				callback(null, err);
			}
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
}

let _dao = new DAO();

module.exports = _dao;
