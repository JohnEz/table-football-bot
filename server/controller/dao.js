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

	addResult(player1, player2, score1, score2, callback) {
		let collection = this.db.collection(scoresCollection);

		collection.insertOne( { team1: player1, team2: player2, team1Score: score1, team2Score: score2 }, function(err) {
			if (err) {
				console.log(err);
			}
			callback(!err);
		});

	}

	getPlayerID(searchTerm, callback) {
		let collection = this.db.collection(playersCollection);

		collection.findOne( { country : searchTerm }, function(err, doc) {
			//if a document was found
			if (doc) {
				callback(doc._id);
			} else {
				callback(null, err);
				console.log('error:',err);
			}
		});
	}


}

let _dao = new DAO();

module.exports = _dao;
