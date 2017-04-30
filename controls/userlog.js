/**
 * The userlog is a log that records all user submit historym
 * though source code is not saved (but rather a md5 hash of it).
 * It is mainly used to find out suspicious actions and in the
 * event of score loss, used as a proof of score.
 */

const nedb = require('nedb');
const debug = require('debug')('themis:userlog');
const path = require('path');
const md5 = require('md5');

const UserLog = new nedb({
	filename: path.join(process.cwd(), 'data', '.userlog.db'),
	autoload: true
});

/**
 * Adds a new user into the user log.
 * @param {string} 		username The user's username.
 * @param {Function} 	cb		   The callback function.
 */
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

/**
 * Receives the user's log async-ly.
 * @param  {string}   username The user's username.
 * @param  {Function} cb       The callback function (err, log) => { }
 */
function getUser(username, cb) {
	UserLog.findOne({ username: username }, cb);
}

/**
 * Add a submission. Content will be hashed before saving.
 * @param {string} user     The user that submitted the file.
 * @param {string} filename The submitted filename.
 * @param {string} contents The submitted file's content.
 */
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

/**
 * Add a score.
 * New score overrides old ones, no matter how different.
 * @param  {string} user    The user that submitted the file.
 * @param  {string} problem The problem that was attempted.
 * @param  {[type]} contents The given submission's Log.verdict.
 */
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
