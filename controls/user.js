const xml = require('xml2js');
const path = require('path');
const md5 = require('md5');
const fs = require('fs');
const debug = require('debug')('themis:controls:user');

let xmlFile = null;

/**
 * Stores user information
 */
class User {
	/**
	* Constructs an user
	* @param {string} username The user's username, which the user will use to login.
	* @param {string} password The user's password, which the user will use to login.
	* @param {string} name     The user's display name, which shows on the scoreboard.
	* @param {XMLRow} row      The user's row in the XML file.
	*/
	constructor(username, password, name, row) {
		/**
		* The user's username.
		* @type {string}
		*/
		this.username = username;
		/**
		* The user's password - md5 hashed.
		* @type {string}
		*/
		this.password = password;
		/**
		* The user's display name.
		* @type {string}
		*/
		this.name = name;
		/**
		 * The user's row in xmlFile.
		 * @type {XMLRow}
		 */
		this.row = row;
		debug(`User ${this.name} added.`);
	}
	save(cb = err => { if (err) debug(err); }) {
		this.row.Cell[1].Data[0]._ = this.username;
		this.row.Cell[2].Data[0]._ = this.password;
		this.row.Cell[3].Data[0]._ = this.name;
		this.row.Cell[4].Data[0]._ = '1';
		const build = new xml.Builder();
		return fs.writeFile('data/account.xml', build.buildObject(xmlFile), cb);
	}
}
/**
* The list of all Users
* @type {Array<String>}
*/
User.Users = {};

/**
* Scans the .xml file and list all users.
*/
(function scanUsers() {
	fs.readFile(path.join(process.cwd(), 'data', 'account.xml'), (err, file) => {
		if (err) throw new Error('Please setup data/account.xml!');
		xml.parseString(file, (err, result) => {
			if (err) throw new Error('Invalid data/account.xml file');
			try {
				xmlFile = result;
				const Rows = xmlFile.Workbook.Worksheet[0].Table[0].Row;
				for (let i = 1; i < Rows.length; ++i) {
					if (!Rows[i].Cell[0].Data) break;
					let username = Rows[i].Cell[1].Data[0]._;
					let password = Rows[i].Cell[2].Data[0]._;
					let name = Rows[i].Cell[3].Data[0]._;
					if (Rows[i].Cell[4].Data[0]._ == '0') password = md5(password);
					User.Users[username] = new User(username, password, name, Rows[i]);
				}
			} catch (e) {
				if (process.env.NODE_ENV !== 'production') throw e;
				throw new Error('Invalid data/account.xml file');
			}
		});
	});
})();

/**
* Find an user with the specified username.
* @returns {User} The user found, or null.
*/
User.find = function (username) {
	return (username in User.Users ? User.Users[username] : null);
};

module.exports = User;
