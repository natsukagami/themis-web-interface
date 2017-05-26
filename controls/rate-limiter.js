const brute = require('express-brute');
const bruteNedb = require('express-brute-nedb');
const path = require('path');

// Let the object self-compact. Fixes the previously commented
// problem about filesize.
let store = new bruteNedb({
	filename: path.join(process.cwd(), 'data', '.ratelimits.db')
});

// Creates a rate-limiter with an array of options.
module.exports = function createBrute(options = [0, 1, 1, 1]) {
	return new brute(store, Object.assign({}, {
		handleStoreError: require('debug')('themis:ratelimit')
	}, {
		freeRetries: options[0],
		minWait: options[1],
		maxWait: options[2],
		lifetime: options[3]
	}));
};
