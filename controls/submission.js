const extTable = {
	'C++': 'cpp',
	'Pascal': 'pas',
	'Python': 'py'
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
		this.filename = filename;
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

module.exports = Submission;
