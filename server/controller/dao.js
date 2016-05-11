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

		collection.findOne( { $or: [ { country : searchTerm }, { slackID : searchTerm } ] }, function(err, doc) {
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

	addResult(player1, player2, score1, score2, callback) {
		let collection = this.db.collection(scoresCollection);
		let dateAdded = new Date();

		collection.insertOne( { team1: player1, team2: player2, team1Score: score1, team2Score: score2, date: dateAdded }, function(err) {
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
					query = { $or: [ { team1 : player1Doc._id, team2 : player2Doc._id }, { team1 : player2Doc._id, team2 : player1Doc._id } ] };
				} else if (player1Doc) {
					query = { $or: [ { team1 : player1Doc._id }, { team2 : player1Doc._id } ] };
				}

				collection.aggregate( [ { $match: query }, { $limit : count } ] ).sort( { date: -1 } ).each(function(err, doc) {
					//if there was an error with the database
					if (err) {
						callback(null, err)
						console.log('error', err);
					} else if (doc) {
						//if there is a document, add it
						doc.team1 = playersMap.get(JSON.stringify(doc.team1));
						doc.team2 = playersMap.get(JSON.stringify(doc.team2));

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


}

let _dao = new DAO();

module.exports = _dao;
