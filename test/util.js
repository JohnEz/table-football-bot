'use strict';

const expect = require('chai').expect;
const util = require('../server/util');

describe('Util', function () {

	it('should maltch the "me" synonyms', function () {
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


});
