const Submission = require('../controls/submission');

/**
 * The localStorage wrapper.
 * Every localStorage-related usage should go through this, as it is implemented
 * with auto sync and data race prevention.
 * @class LocalStorage
 */
class LocalStorage {
	constructor() {
		// Compability update
		if (localStorage.getItem('username') !== null) {
			this.users = {
				[localStorage.getItem('username')]: {
					submissions: JSON.parse(localStorage.getItem('submissions')),
					selected: Number(localStorage.getItem('selected'))
				}
			};
			localStorage.clear();
			this.save();
		}
		// Loads all users
		this.users = JSON.parse(localStorage.getItem('users'));
		if (this.users === null) {
			// First run
			this.users = {};
			this.save();
		}
		this.user = null;
	}
	// Save the items into localStorage.
	save() {
		localStorage.setItem('users', JSON.stringify(this.users));
	}
	// The following items are getter and setter implementations.
	set User(user) {
		this.user = user;
		if (!(user in this.users)) {
			this.users[user] = { submissions: [], selected: null };
			this.save();
		}
	}
	get submissions() {
		return this.users[this.user].submissions.map(item => new Submission(item));
	}
	set submissions(sub) {
		this.users[this.user].submissions = sub;
		this.save();
	}
	get selected() { return this.users[this.user].selected; }
	set selected(sel) {
		this.users[this.user].selected = sel;
		this.save();
	}
}

const lc = new LocalStorage();

module.exports = lc;
