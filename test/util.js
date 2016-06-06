'use strict';

const expect = require('chai').expect;
const util = require('../server/util');

describe('Util', function () {

	it('should match the "me" synonyms', function () {
		let me = ['i', 'me', 'my', 'myself', 'I', 'MYSELF'];
		me.forEach(function(value) {
			expect(util.isMe(value)).to.be.true;
		});
	});

	it('should not match names and countries', function () {
		let me = ['rbeckett', 'england', 'U161494GS', 'irene'];
		me.forEach(function(value) {
			expect(util.isMe(value)).to.be.false;
		});
	});

	it('should not match null to me', function() {
		expect(util.isMe(null)).to.be.false;
	});

	it('should not match undefined to me', function() {
		expect(util.isMe(undefined)).to.be.false;
	});

	it('shouldn\'t change numbers', function() {
		let numbers = [0, -10, 5, 10, 9873];
		numbers.forEach(function(num) {
			expect(util.convertWordToNumber(num)).to.equal(num)
		});
	});

	it('should change numbers which are strings', function() {
		let numbers = ['0', '-10', '5', '10', '9873'];
		numbers.forEach(function(num) {
			expect(util.convertWordToNumber(num)).to.equal(parseInt(num))
		});
	});

	it('should change numbers which are words', function() {
		let numbers = {'nil': 0, 'zero': 0, 'three': 3, 'seven': 7, 'ten': 10, 'fifteen': 15, 'nineteen': 19};
		for (let key in numbers){
			expect(util.convertWordToNumber(key)).to.equal(numbers[key]);
		}
	});

	it('should return null for an unknown number or word', function() {
		let  words = ['twenty five', 'thirty', 'a jillion', 'one hundred million'];
		words.forEach(function(word) {
			expect(util.convertWordToNumber(word)).to.equal(null);
		})
	});

	it('should not fail on null or undefined', function() {
		expect(util.convertWordToNumber(null)).to.equal(null);
		expect(util.convertWordToNumber()).to.equal(null);
	});
});

describe('Util Date Parse', function () {
	const today = new Date(2016, 4, 24); // 24th May 2016

	it('should return a correct date object', function() {
		expect(util.parseLuisDate('2016-05-25', today).getTime()).to.equal(new Date(2016, 4, 25).getTime());
	});

	it('should return a today date object', function() {
		expect(util.parseLuisDate('2016-05-24', today).getTime()).to.equal(new Date(2016, 4, 24).getTime());
	});

	it('should return a correct date object given no year (month later)', function() {
		expect(util.parseLuisDate('XXXX-08-25', today).getTime()).to.equal(new Date(2016, 7, 25).getTime());
	});

	it('should return a correct date object given no year (month earlier)', function() {
		expect(util.parseLuisDate('XXXX-04-25', today).getTime()).to.equal(new Date(2017, 3, 25).getTime());
	});

	it('should return a correct date object given no year (month same, day earlier)', function() {
		expect(util.parseLuisDate('XXXX-05-23', today).getTime()).to.equal(new Date(2017, 4, 23).getTime());
	});

	it('should return a correct date object given no month or year (day later)', function() {
		expect(util.parseLuisDate('XXXX-XX-28', today).getTime()).to.equal(new Date(2016, 4, 28).getTime());
	});

	it('should return a correct date object given no month or year (day earlier)', function() {
		expect(util.parseLuisDate('XXXX-XX-18', today).getTime()).to.equal(new Date(2016, 5, 18).getTime());
	});

});

describe('Util work hours', function() {

	it('should return false for Saturday', function() {
		expect(util.workingHours(new Date(2016, 5, 4))).to.be.false;
	});

	it('should return false for Sunday', function() {
		expect(util.workingHours(new Date(2016, 6, 10))).to.be.false;
	});

	it('should return false for before 8am', function() {
		expect(util.workingHours(new Date(2016, 5, 8, 7, 59))).to.be.false;
	});

	it('should return false for after 3pm', function() {
		expect(util.workingHours(new Date(2016, 5, 8, 16, 0))).to.be.false;
	});

	it('should return true for a Monday for after 8', function() {
		expect(util.workingHours(new Date(2016, 5, 6, 8, 0))).to.be.true;
	});

	it('should return true for a Friday before 4', function() {
		expect(util.workingHours(new Date(2016, 5, 24, 15, 59 ))).to.be.true
	});

	it('should return true for a midweek', function() {
		expect(util.workingHours(new Date(2016, 5, 22, 12, 35 ))).to.be.true
	});

	it('should return false for a non date', function() {
		expect(util.workingHours('foobar')).to.be.false;
	});

});
