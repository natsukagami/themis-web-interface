// The following tables list supported languages and their respective conversion
// between name and extension name.
const extTable = {
	'C++': 'cpp',
	'Pascal': 'pas',
	'Python': 'py',
	'Java': 'java'
};
const langTable = {
	'cpp': 'C++',
	'pas': 'Pascal',
	'py': 'Python',
	'java': 'Java'
};

/**
 * Submission is an unified struct shared by both the server and client that
 * represents a submission.
 * @class Submission
 */
class Submission {
	constructor({
		filename,
		ext,
		content = '',
		saveStatus = 'saved',
		result = {}
	}) {
		/**
		 * The submission's id.
		 * It is not numbered client-side.
		 * @type {Number}
		 */
		this.id = ++Submission.id;
		/**
		 * The submission's filename, uppercased to better support case-
		 * insensitive problem names.
		 * @type {string}
		 */
		this.filename = filename.toUpperCase();
		/**
		 * The submission's extension.
		 * @type {string}
		 */
		this.ext = ext;
		/**
		 * The submission's content, saved as plain text.
		 * @type {string}
		 */
		this.content = content;
		/**
		 * The Log.content of the submission.
		 * @type {Log.content}
		 */
		this.result = result;
		/**
		 * Save status, only appears client-side.
		 * It is either 'saved' (locally saved) or 'submitted' (submitted to server).
		 * @type {string}
		 */
		this.saveStatus = saveStatus;
	}
	/**
	 * Returns the filename.
	 * @property name
	 * @type {string}
	 */
	get name() {
		return this.filename + '.' + extTable[this.ext];
	}
	/**
	 * Returns an object that contains the submission's information.
	 * Can be useful for JSON serialization and sending.
	 * @return {Object} The information object.
	 */
	toSend() {
		return {
			filename: this.filename,
			ext: this.ext,
			content: this.content
		};
	}
}
Submission.id = 0;

Submission.ext = extTable;
Submission.lang = langTable;

module.exports = Submission;
