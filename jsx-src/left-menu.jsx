import PropTypes from 'prop-types';
import React from 'react';
import { Label, Badge, Button, Glyphicon } from 'react-bootstrap';
import Dimensions from 'react-dimensions';
import FlipMove from 'react-flip-move';
import { Add, Upload } from './submission-create.jsx';
const Submission = require('../controls/submission');
const MediaQuery = require('react-responsive');

const JudgeLog = require('./judgelog.jsx');
const FileServer = require('./file-server.jsx');
const Queue = require('./queue.jsx');

/**
 * Displays the save status of a submission as a Bootstrap label.
 * @class SaveStatus
 * @param {string} status The submission's save status, 'saved' or 'submitted'.
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
	status: PropTypes.oneOf(['saved', 'submitted']).isRequired
};

/**
 * Displays the submission as a row on the left menu.
 * @class LeftMenuItem
 * @param {Number}   id         The submission's id.
 * @param {string}   name       The submission's name.
 * @param {string}   saveStatus The submission's save status.
 * @param {boolean}  active     Is it the currently selected one?
 * @param {string}   verdict    The submission's result verdict.
 * @param {Function} onSelect   Submission-related event handler.
 * @param {Function} onDelete   Submission-related event handler.
 * @param {Function} onUpdate   Submission-related event handler.
 */
class LeftMenuItem extends React.Component {
	// Handles deletion with a confirm box.
	handleDelete() {
		if (window.confirm('Bạn có muốn xóa bài ' + this.props.name + ' không?')) {
			this.props.onDelete(this.props.id);
		}
	}
	render() {
		let x = null;
		// Only attempt to render the submission's results if it is submitted.
		if (this.props.saveStatus === 'submitted' || this.props.verdict !== '')
			x = <Badge><JudgeLog name={this.props.name} verdict={this.props.verdict} updateResults={this.props.onUpdate} /></Badge>;
		return <div
			key={this.id}
			className={'list-group-item' + (this.props.active ? ' active' : '')}
		>
			<Button bsStyle='danger' bsSize='xs' onClick={() => this.handleDelete()}><Glyphicon glyph='remove' /></Button>
			<a href='#' onClick={() => this.props.onSelect(this.props.id)} style={{ fontSize: '1vw' }}>
				{' ' + this.props.name + ' '}
			</a>
			{x}
			<div style={{ paddingTop: '5px' }}>
				<SaveStatus status={this.props.saveStatus}></SaveStatus>
			</div>
		</div>;
	}
}
LeftMenuItem.propTypes = {
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	saveStatus: PropTypes.oneOf(['saved', 'submitted']).isRequired,
	active: PropTypes.bool.isRequired,
	verdict: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	onSelect: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	onUpdate: PropTypes.func.isRequired
};
LeftMenuItem.defaultProps = {
	verdict: ''
};

/**
 * The left menu is, well, 70% of the complexity of the UI.
 * @class LeftMenu
 * @param {[Submission]} submissions    The list of submissions.
 * @param {Number}       selected       Index of the selected submission.
 * @param {Function}     on...          Submission event handlers (listed below).
 * @param {Number}       containerWidth The container width allowed.
 */
class LeftMenu extends React.Component {
	render() {
		const content = <div>
			<h4>Các bài nộp</h4>
			<FlipMove className='list-group' style={{ fontSize: '80%' }}>
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
			</FlipMove>
			<hr />
			<Add onAdd={this.props.onAdd} />
			<hr />
			<Upload onAdd={this.props.onAdd} />
			<hr />
			<Queue />
			<hr />
			<FileServer />
		</div>;
		// We have to render the layout a little differently, depends on the
		// screen width.
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
	submissions: PropTypes.arrayOf(PropTypes.instanceOf(Submission)).isRequired,
	selected: PropTypes.number,
	onSelect: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	onAdd: PropTypes.func.isRequired,
	onUpdate: PropTypes.func.isRequired,
	containerWidth: PropTypes.number.isRequired
};

module.exports = Dimensions()(LeftMenu);
