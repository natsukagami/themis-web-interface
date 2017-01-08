const nedb = require('nedb');
const debug = require('debug')('themis:userlog');
const path = require('path');
const md5 = require('md5');

const UserLog = new nedb({
	filename: path.join(process.cwd(), 'data', '.userlog.db'),
	autoload: true
});

function addUser(username, cb = () => {}) {
	// Adds a new user.
	UserLog.findOne({ username: username }, (err, user) => {
		if (err) return cb(err);
		if (user === null) {
			UserLog.insert({
				username: username,
				submits: { },
				scores: { }
			}, (err, user) => {
				if (cb) cb(err, user);
			});
		} else cb();
	});
}

function getUser(username, cb) {
	UserLog.findOne({ username: username }, cb);
}

function addSubmit(username, filename, contents) {
	getUser(username, (err, user) => {
		if (err) {
			debug(err); return; // Can't happen
		}
		UserLog.update({ _id: user._id }, {
			$set: { [`submits.${filename}`]: md5(contents.replace(/\s/g, '')) }
		});
	});
}

function addScore(username, problem, contents) {
	getUser(username, (err, user) => {
		if (err) {
			debug(err); return; // Can't happen
		}
		UserLog.update({ _id: user._id }, {
			$set: { [`scores.${problem}`]: contents }
		});
	});
}

module.exports = {
	addUser: addUser,
	addSubmit: addSubmit,
	addScore: addScore
};
