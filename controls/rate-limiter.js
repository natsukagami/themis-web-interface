const brute = require('express-brute');
const bruteNedb = require('express-brute-nedb');
const path = require('path');

// Using neDB as a Rate-limiting database is not recommended,
// as write-only binding creates unneccessary memory usage.
let store = new bruteNedb({
	filename: path.join(process.cwd(), 'data', '.ratelimits.db')
});

module.exports = function createBrute(options = {}) {
	return new brute(store, Object.assign({}, {
		handleStoreError: require('debug')('themis:ratelimit')
	}, options));
};
