const fs = require('fs');
const path = require('path');
const rEs = require('escape-string-regexp');
const debug = require('debug')('themis:judgelog');

const logsPath = path.join(process.cwd(), 'data', 'submit', 'logs');

class Log {
	static filename(user, problem, ext) {
		return path.join(logsPath, `0[${user}][${problem}]${ext}.log`);
	}
	static __parse(user, problem, content) {
		const lines = content.split('\r\n'); // Must be \r\n because Windows
		const verdict = lines[0].match(new RegExp(rEs(`${user}‣${problem}: `) + '(.+)', 'i'))[1];
		if (isNaN(Number(verdict))) {
			return {
				verdict: verdict,
				details: lines.slice(2).join('\r\n')
			};
		}
		const res = lines.slice(4);
		const details = [];
		for (let i = 0; i + 1 < res.length; i += 3) {
			details.push({
				id: res[i].match(new RegExp(rEs(`${user}‣${problem}‣`) + '(.+)' + rEs(': ') + '(.+)', 'i'))[1],
				score: Number(res[i].match(new RegExp(rEs(`${user}‣${problem}‣`) + '(.+)' + rEs(': ') + '(.+)', 'i'))[2]),
				time: Number(res[i + 1].match('Thời gian ≈ (.+) giây')[1]),
				verdict: res[i + 2]
			});
		}
		return {
			verdict: verdict,
			details: details
		};
	}
	constructor(created, user, problem, content) {
		this.created = created;
		this.user = user;
		this.problem = problem;
		this.content = Log.__parse(user, problem, content);
	}
}

const Logs = { };

function getLog(user, problem, ext, callback) {
	if (!Logs[user]) Logs[user] = {};
	if (Logs[user][problem + ext] !== undefined) return callback(Logs[user][problem + ext]);
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

getLog.setLog = (user, problem, ext, contents) => {
	if (!Logs[user]) Logs[user] = {};
	Logs[user][problem + ext] = contents;
};

module.exports = getLog;
