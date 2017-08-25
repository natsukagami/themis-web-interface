import React from 'react';
import { Form, FormControl, Button, Glyphicon } from 'react-bootstrap';
const Submission = require('../controls/submission');

/**
 * The inline form to add a submission by providing a name and extension.
 * @class AddSubmission
 * @param    {Function} onAdd    The function called to add a new submission into
 * storage.
 * @property {string}   filename The new submission's filename.
 * @property {string}   ext      The new submission's extension.
 */
class AddSubmission extends React.Component {
	constructor() {
		super();
		this.state = {
			filename: '',
			ext: 'C++'
		};
	}
	// Handles filename field change.
	filenameChange(value) {
		this.setState({ filename: value });
	}
	// Handles extension field change.
	extChange(value) {
		this.setState({ ext: value });
	}
	/**
	 * Perform insertion of new submission.
	 * @method add
	 * @return {boolean} Whether the operation succeeds.
	 */
	add() {
		if (this.state.filename === '') return false; // Don't allow untitled files
		let sub = new Submission(Object.assign({}, this.state));
		this.setState({ filename: '' });
		this.props.onAdd(sub);
	}
	render() {
		return <Form inline={true}>
			<FormControl
				type='text'
				placeholder='Tên bài'
				value={this.state.filename}
				onChange={e => this.filenameChange(e.target.value)}
				style={{width: '45%', fontSize: '11px'}}
				required
			/>
			<FormControl
				componentClass='select'
				style={{width: '35%', marginLeft: '5px'}}
				bsSize='small'
				value={this.state.ext}
				onChange={e => this.extChange(e.target.value)}
			>
				{Object.keys(Submission.ext).map(ext => {
					return <option value={ext} key={ext}>{ext}</option>;
				})}
			</FormControl>
			<Button
				type='submit'
				bsStyle='success'
				bsSize='small'
				style={{width: '15%', marginLeft: '5px'}}
				onClick={() => this.add()}
			>
				<Glyphicon glyph='plus'/>
			</Button>
		</Form>;
	}
}
AddSubmission.propTypes = {
	onAdd: React.PropTypes.func.isRequired
};

/**
 * Similar to the last one, but this one even uploads a file (not really),
 * and loads its content into storage.
 * @class UploadSubmission
 * @param    {Function} onAdd     The function called to add a new submission
 * into storage.
 * @property {Object}   file      The uploaded file object.
 * @property {boolean}  uploading Is the upload in-progress?
 */
class UploadSubmission extends React.Component {
	constructor() {
		super();
		this.state = { file: null, uploading: false };
	}
	fileChange(file) {
		return this.setState({ file: (file ? file : null) });
	}
	add() {
		if (this.state.file === null) return false; // Don't allow null file uploads
		const file = this.state.file;
		const filepath = this.state.file.name;
		const extName = require('path').extname(filepath);
		const baseName = require('path').basename(filepath, extName);
		if (file.size > 1024 * 1024) { // File larger than 1mb, cannot render
			return alert('File too large!');
		}
		// Starts reading, disables upload
		this.setState({ uploading: true }, () => {
			const fr = new FileReader();
			fr.onload = () => {
				this.setState({ file: null, uploading: false });
				this.props.onAdd(new Submission({
					filename: baseName,
					ext: Submission.lang[extName.toLowerCase().replace('.', '')],
					content: fr.result
				}));
			};
			fr.readAsText(file);
		});
	}
	render() {
		return <Form inline>
			<FormControl
				type='file'
				placeholder='Tải lên bài'
				onChange={ e => this.fileChange(e.target.files[0]) }
				accept='.cpp,.pas,.py'
				multiple={false}
				style={{width: '82%', display: 'inline'}}
			/>
			<Button
				type='submit'
				bsSize='small'
				style={{width: '15%', marginLeft: '5px'}}
				bsStyle='success'
				disabled={this.state.uploading}
				onClick={() => this.add()}
			>
				<Glyphicon glyph='upload'/>
			</Button>
		</Form>;
	}
}
UploadSubmission.propTypes = {
	onAdd: React.PropTypes.func.isRequired
};

module.exports = {
	Add: AddSubmission,
	Upload: UploadSubmission
};
