const brute = require('express-brute');
const bruteNedb = require('express-brute-nedb');
const path = require('path');

let store = new bruteNedb({
	filename: path.join(process.cwd(), 'data', '.ratelimits.db')
});

module.exports = function createBrute(options = {}) {
	return new brute(store, Object.assign({}, {
		handleStoreError: require('debug')('themis:ratelimit')
	}, options));
};
