import PropTypes from 'prop-types';
import React from 'react';
import Ace from 'react-ace';
import SubmitButton from './submit-button.jsx';
// TODO: How to reduce size of code by removing this but retain C++ functionality?
import 'brace';
const Submission = require('../controls/submission');

require('brace/mode/c_cpp');
require('brace/mode/pascal');
require('brace/mode/python');
require('brace/mode/java');
require('brace/theme/monokai');

/**
 * Use ace / brace editor as the code editor.
 */
class Editor extends React.Component {
	render() {
		return <Ace
			style={{ width: '100%' }}
			mode={Editor.modes[this.props.submission.ext]}
			theme='monokai'
			name='editor'
			onChange={this.props.onChange}
			value={this.props.submission.content}
			editorProps={{ $blockScrolling: true }}
		/>;
	}
}
Editor.modes = {
	'C++': 'c_cpp',
	Pascal: 'pascal',
	Python: 'python',
	Java: 'java'
};
Editor.propTypes = {
	submission: PropTypes.instanceOf(Submission).isRequired,
	onChange: PropTypes.func.isRequired
};

/**
 * EditorBox wraps the ace editor within a div, that also contains a submit
 * button.
 * @class EditorBox
 * @param {Submission} submission The submission being edited.
 * @param {Function}   onChange   The update function, called whenever the
 * editor's content is changed.
 * @param {Function}   onSubmit   The submit function, called when the submit
 * button is clicked.
 */
class EditorBox extends React.Component {
	render() {
		return <div>
			<h4>
				Soạn code
				<span className='pull-right' style={{ paddingBottom: 5 }}><SubmitButton saveStatus={this.props.submission.saveStatus} onSubmit={this.props.onSubmit} /></span>
			</h4>
			<Editor submission={this.props.submission} onChange={this.props.onChange} />
		</div>;
	}
}
EditorBox.propTypes = {
	submission: PropTypes.instanceOf(Submission).isRequired,
	onChange: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired
};

module.exports = EditorBox;
