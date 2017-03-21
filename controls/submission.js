const extTable = {
	'C++': 'cpp',
	'Pascal': 'pas',
	'Python': 'py'
};

const langTable = {
	'cpp': 'C++',
	'pas': 'Pascal',
	'py': 'Python'
};

class Submission {
	constructor({
		filename,
		ext,
		content = '',
		saveStatus = 'saved',
		result = {}
	}) {
		this.id = ++Submission.id;
		this.filename = filename.toUpperCase();
		this.ext = ext;
		this.content = content;
		this.result = result;
		this.saveStatus = saveStatus;
	}
	get name() {
		return this.filename + '.' + extTable[this.ext];
	}
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
