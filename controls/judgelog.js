const fs = require('fs');
const path = require('path');
const rEs = require('escape-string-regexp');
const debug = require('debug')('themis:judgelog');
const Scoring = require('./scoring');

const logsPath = path.join(process.cwd(), 'data', 'submit', 'logs');
const UserLog = require('./userlog');

const globalize = require('globalize');
globalize.load(
	require('./cldr-data/main/en/numbers'),
	require('./cldr-data/main/vi/numbers'),
	require('./cldr-data/supplemental/numberingSystems'),
	require('./cldr-data/supplemental/likelySubtags')
);

/**
 * Try converting string to number with two regional settings (en_US and vi_VN).
 * 
 * @param {string} str
 * @return {Number}
 */
function gNumber(str) {
	const a = globalize('en').numberParser(), b = globalize('vi').numberParser();
	if (isNaN(a(str))) return b(str);
	return a(str);
}

/**
 * Log is an object that wraps a Log file.
 * @class Log
 */
class Log {
	/**
	 * Returns the log filename given its parameters.
	 * @method filename
	 * @static
	 * @param  {string} user    The user that submitted the file.
	 * @param  {string} problem The problem that was attempted.
	 * @param  {string} ext     The extension of the submitted file.
	 * @return {string}         The log filename.
	 */
	static filename(user, problem, ext) {
		return path.join(logsPath, `0[${user}][${problem}]${ext}.log`);
	}
	/**
	 * Internal function, parses the .log file into Log's content.
	 * Parameters were given to get the log file's filename.
	 * @method __parse
	 * @static
	 * @private
	 * @param  {string} user    The user that submitted the file.
	 * @param  {string} problem The problem that was attempted.
	 * @param  {string} ext     The extension of the submitted file.
	 * @return {Object}         The Log.content object.
	 */
	/** About the Log.content object
	* For each test, a struct for its information is presented as below:
	* @class Test
	* @property	{string}	id			The test's id.
	* @property {Number}	score		The test's score.
	* @property {Number}	time		The test's running time.
	* @property {string}	verdict	Judge verdict.
	*
	* The structure of Log.content is defined below
	* @class Log.content
	* @property {string | Number}	verdict	The total score, or the returned judge error.
	* @property {string | [Test]}	details	The detailed judge output, or the array
	* of test results.
	*/
	static __parse(user, problem, content) {
		const lines = content.split('\r\n'); // Must be \r\n because Windows
		const verdict = lines[0].match(new RegExp(rEs(`${user}‣${problem}: `) + '(.+)', 'i'))[1];
		if (isNaN(gNumber(verdict))) {
			// Verdict summary is not a number, therefore the lines following the
			// first are just raw output.
			return {
				verdict: verdict,
				details: lines.slice(2).join('\r\n')
			};
		}
		const res = lines.slice(4);
		const details = [];
		const rFirstLine = new RegExp(rEs(`${user}‣${problem}‣`) + '(.+)' + rEs(': ') + '(.+)', 'i');
		for (let i = 0; i + 1 < res.length; i += 3) {
			// First we rule out some special cases
			// like TLE and RTE.
			if (res[i + 1] === 'Chạy quá thời gian') {
				details.push({
					id: res[i].match(rFirstLine)[1],
					score: gNumber(res[i].match(rFirstLine)[2]),
					time: 0,
					verdict: res[i + 1]
				});
				--i; continue;
			}
			if (res[i + 1] === 'Chạy sinh lỗi') {
				details.push({
					id: res[i].match(rFirstLine)[1],
					score: gNumber(res[i].match(rFirstLine)[2]),
					time: 0,
					verdict: res[i + 1] + ': ' + res[i + 2]
				});
				continue;
			}
			if (!rFirstLine.test(res[i])) {
				if (!details.length) {
					// Ignore, invalid log
				} else {
					// Append to last log
					details[details.length - 1].verdict += '\n' + res[i];
				}
				i -= 2; continue; // Move to next line
			}
			// Here goes the final generic log format.
			details.push({
				id: res[i].match(rFirstLine)[1],
				score: gNumber(res[i].match(rFirstLine)[2]),
				time: gNumber(res[i + 1].match('Thời gian ≈ (.+) giây')[1]),
				verdict: res[i + 2]
			});
		}
		return {
			verdict: gNumber(verdict),
			details: details
		};
	}
	constructor(created, user, problem, content) {
		/**
		 * The log file's creation time.
		 * It is taken from fs.Stat's mtime property.
		 * @property created
		 * @type {Date}
		 */
		this.created = created;
		/**
		 * The user who submitted the solution.
		 * @type {string}
		 */
		this.user = user;
		/**
		 * The problem.
		 * @type {string}
		 */
		this.problem = problem;
		/**
		 * The judge file's content, parsed by the function above.
		 * @type {Object}
		 */
		this.content = Log.__parse(user, problem, content);
		// When a new log is parsed, we should also update
		// the contestant's score to the scoreboard and userlog.
		Scoring.add(user, problem, this.content.verdict);
		UserLog.addScore(user, problem, this.content);
	}
}

const Logs = { };

/**
 * Asynchronorously gets the latest log.
 * This first checks for any un-parsed log file, and fallback to
 * the latest parsed when none is available.
 * @param  {string} user    The user that submitted the file.
 * @param  {string} problem The problem that was attempted.
 * @param  {string} ext     The extension of the submitted file.
 * @param  {Function} callback The callback function.
 */
function getLog(user, problem, ext, callback) {
	if (!Logs[user]) Logs[user] = {};
	fs.stat(Log.filename(user, problem, ext), (err, stat) => {
		if (err) return callback(null);
		if (Logs[user][problem + ext] === undefined || Logs[user][problem + ext].created.getTime() < stat.mtime.getTime()) {
			debug(`New log for ${user} on ${problem + ext}`);
			// newer log available
			return fs.readFile(Log.filename(user, problem, ext), 'utf-8', (err, contents) => {
				Logs[user][problem + ext] = new Log(stat.mtime, user, problem, contents);
				return callback(Logs[user][problem + ext]);
			});
		}
		return callback(Logs[user][problem + ext]); // Use old one
	});
}

// Sets the log from elsewhere.
getLog.setLog = (user, problem, ext, contents) => {
	if (!Logs[user]) Logs[user] = {};
	Logs[user][problem + ext] = contents;
};

// Expose the Log collection, for ??? purpose (lol).
getLog.Log = Log;

module.exports = getLog;
