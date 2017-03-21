import React from 'react';
import { Label, Badge, Button, Glyphicon, Form, FormControl } from 'react-bootstrap';
import Dimensions from 'react-dimensions';
const Submission = require('../controls/submission');
const MediaQuery = require('react-responsive');

const JudgeLog = require('./judgelog.jsx');
const FileServer = require('./file-server.jsx');
const Queue = require('./queue.jsx');

/**
 * SaveStatus: Displays the save status of a submission
 * as a Bootstrap label
 */
class SaveStatus extends React.Component {
	render() {
		return SaveStatus.stateBoard[this.props.status];
	}
}
SaveStatus.stateBoard = {
	'submitted': <Label bsStyle={'success'}>✓Đã nộp</Label>,
	'saved': <Label bsStyle={'info'}>✓Đã lưu</Label>
};
SaveStatus.propTypes = {
	status: React.PropTypes.oneOf(['saved', 'submitted']).isRequired
};

/**
 * LeftMenuItem: Displays the submission as a row on the left menu.
 */
class LeftMenuItem extends React.Component {
	handleDelete() {
		if (window.confirm('Bạn có muốn xóa bài ' + this.props.name + ' không?')) {
			this.props.onDelete(this.props.id);
		}
	}
	render() {
		let x = '';
		if (this.props.saveStatus === 'submitted' || this.props.verdict !== '')
			x = <Badge><JudgeLog name={this.props.name} verdict={this.props.verdict} updateResults={this.props.onUpdate}/></Badge>;
		return <div
			className={'list-group-item' + (this.props.active ? ' active' : '')}
		>
			<Button bsStyle='danger' bsSize='xs' onClick={() => this.handleDelete()}><Glyphicon glyph='remove'/></Button>
			<a href='#' onClick={() => this.props.onSelect(this.props.id)} style={{ fontSize: '1vw' }}>
				{' ' + this.props.name + ' '}
			</a>
			{x}
			<div style={{paddingTop: '5px'}}>
				<SaveStatus status={this.props.saveStatus}></SaveStatus>
			</div>
		</div>;
	}
}
LeftMenuItem.propTypes = {
	id: React.PropTypes.number.isRequired,
	name: React.PropTypes.string.isRequired,
	saveStatus: React.PropTypes.oneOf(['saved', 'submitted']).isRequired,
	active: React.PropTypes.bool.isRequired,
	verdict: React.PropTypes.string,
	onSelect: React.PropTypes.func.isRequired,
	onDelete: React.PropTypes.func.isRequired,
	onUpdate: React.PropTypes.func.isRequired
};
LeftMenuItem.defaultProps = {
	verdict: ''
};

/**
 * The inline form to add a submission by providing a name and extension
 */
class AddSubmission extends React.Component {
	constructor() {
		super();
		this.state = {
			filename: '',
			ext: 'C++'
		};
	}
	filenameChange(value) {
		this.setState({ filename: value });
	}
	extChange(value) {
		this.setState({ ext: value });
	}
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
				bsSize='small'
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
				bsSize='small'
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

/**
 * LeftMenu
 */
class LeftMenu extends React.Component {
	render() {
		const content = <div><h4>Các bài nộp</h4>
		<div className='list-group' style={{fontSize: '80%'}}>
			{this.props.submissions.map((sub, id) => <LeftMenuItem
				id={id}
				name={sub.name}
				saveStatus={sub.saveStatus}
				verdict={sub.result.verdict}
				active={id === this.props.selected}
				key={sub.id}
				onSelect={this.props.onSelect}
				onDelete={this.props.onDelete}
				onUpdate={results => this.props.onUpdate(id, results)}
			/>)}
		</div>
		<hr/>
		<AddSubmission onAdd={this.props.onAdd}/>
		<hr/>
		<UploadSubmission onAdd={this.props.onAdd}/>
		<hr/>
		<Queue/>
		<hr/>
		<FileServer/></div>;
		return <div>
			<MediaQuery query='(min-width: 992px)'><div
				className='affix no-scrollbar'
				style={{
					width: this.props.containerWidth,
					maxHeight: '90%',
					height: '90%',
					overflowY: 'auto',
					paddingBottom: '50px'
				}}
				data-offset-bottom={20}
			>
				{content}
			</div></MediaQuery>
			<MediaQuery query='(max-width: 991px)'>
				{content}
			</MediaQuery>
		</div>;
	}
}
LeftMenu.propTypes = {
	submissions: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Submission)).isRequired,
	selected: React.PropTypes.number,
	onSelect: React.PropTypes.func.isRequired,
	onDelete: React.PropTypes.func.isRequired,
	onAdd: React.PropTypes.func.isRequired,
	onUpdate: React.PropTypes.func.isRequired,
	containerWidth: React.PropTypes.number.isRequired
};

module.exports = Dimensions()(LeftMenu);
