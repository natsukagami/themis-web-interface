const xml = require('xml2js');
const path = require('path');
const md5 = require('md5');
const fs = require('fs');
const debug = require('debug')('themis:controls:user');
const eventEmitter = require('events');

const UserLog = require('./userlog');

let xmlFile = null;

/**
 * The XML Writer object saves the XML file on request every second
 * @type {eventEmitter}
 */
const xmlWriter = new eventEmitter();

/**
 * Whether the XML build needs to be performed.
 * @type {Boolean}
 */
xmlWriter.flag = false;

/**
 * Build checks whether a build is needed, and perform it when
 * neccessary.
 * @method build
 */
xmlWriter.build = function() {
	if (!this.flag) return this.emit('build-finish');
	debug('account.xml being updated.');
	this.flag = false;
	const build = new xml.Builder();
	this.emit('build-start');
	return fs.writeFile('data/account.xml', build.buildObject(xmlFile), () => {
		this.emit('build-finish');
	});
};
// On build finish, perform a check later.
xmlWriter.on('build-finish', () => {
	setTimeout(() => { xmlWriter.build(); }, 1000);
});
// Perform the first build.
xmlWriter.build();

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
		UserLog.addUser(this.username);
		debug(`User ${this.name} added.`);
	}
	save(cb = err => { if (err) debug(err); }) {
		this.row.Cell[1].Data[0]._ = this.username;
		this.row.Cell[2].Data[0]._ = this.password;
		// The following line fixes the bug where the XML
		// file turns unreadable because of Number password
		// being casted to string by md5 but the type did
		// not change.
		this.row.Cell[2].Data[0].$['ss:Type'] = 'String';
		this.row.Cell[3].Data[0]._ = this.name;
		this.row.Cell[4].Data[0]._ = '1';
		xmlWriter.flag = true;
		xmlWriter.once('build-start', cb);
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
					if (Rows[i].Cell[2].Data[0].$['ss:Type'] != 'String') {
						// A hotfix for issue17, *sigh*
						User.Users[username].save();
					}
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

/**
 * Adds an user to the XML file
 * @param {string}   username The new user's username
 * @param {string}   password The new user's password
 * @param {string}   name     The new user's display name
 * @param {Function} callback
 */
User.add = function({
	username,
	password,
	name
}, callback) {
	if (User.Users[username] !== undefined) return callback(new Error('Username already exists'));
	const Rows = xmlFile.Workbook.Worksheet[0].Table[0].Row;
	const newRow = {
		'$': {
			'ss:AutoFitHeight': '0'
		},
		Cell: [
			{
				'$': {
					'ss:StyleID': 's68'
				},
				Data: [
					{
						_: '0',
						'$': {
							'ss:Type': 'Number'
						}
					}
				]
			}, {
				'$': {
					'ss:StyleID': 's68'
				},
				Data: [
					{
						_: username,
						'$': {
							'ss:Type': 'String'
						}
					}
				]
			}, {
				'$': {
					'ss:StyleID': 's68'
				},
				Data: [
					{
						_: md5(password),
						'$': {
							'ss:Type': 'String'
						}
					}
				]
			}, {
				'$': {
					'ss:StyleID': 's68'
				},
				Data: [
					{
						_: name,
						'$': {
							'ss:Type': 'String'
						}
					}
				]
			}, {
				'$': {
					'ss:StyleID': 's68'
				},
				Data: [
					{
						_: '1',
						'$': {
							'ss:Type': 'Number'
						}
					}
				]
			}, {
				'$': {
					'ss:StyleID': 's68'
				}
			}, {
				'$': {
					'ss:StyleID': 's68'
				}
			}, {
				'$': {
					'ss:StyleID': 's68'
				}
			}
		]
	};
	Rows[Object.keys(User.Users).length + 1] = newRow;
	User.Users[username] = new User(username, md5(password), name, newRow);
	User.Users[username].save(() => { callback(null); });
};


module.exports = User;
