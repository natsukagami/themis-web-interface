import React from 'react';
import Ace from 'react-ace';
import SubmitButton from './submit-button.jsx';
const Submission = require('../controls/submission');

// TODO: How to reduce size of code by removing this but retain C++ functionality?
import 'brace';

require('brace/mode/c_cpp');
require('brace/mode/pascal');
require('brace/mode/python');
require('brace/theme/monokai');

/**
 * Use ace / brace editor as the code editor.
 */
class Editor extends React.Component {
	render() {
		return <Ace
			style={{width: '100%'}}
			mode={Editor.modes[this.props.submission.ext]}
			theme='monokai'
			name='editor'
			onChange={this.props.onChange}
			value={this.props.submission.content}
			editorProps={{$blockScrolling: true}}
		/>;
	}
}
Editor.modes = {
	'C++': 'c_cpp',
	Pascal: 'pascal',
	Python: 'python'
};
Editor.propTypes = {
	submission: React.PropTypes.instanceOf(Submission).isRequired,
	onChange: React.PropTypes.func.isRequired
};

class EditorBox extends React.Component {
	render() {
		return <div>
			<h4>
				Soạn code
				<span className='pull-right' style={{ paddingBottom: 5 }}><SubmitButton saveStatus={this.props.submission.saveStatus} onSubmit={this.props.onSubmit}/></span>
			</h4>
			<Editor submission={this.props.submission} onChange={this.props.onChange}/>
		</div>;
	}
}
EditorBox.propTypes = {
	submission: React.PropTypes.instanceOf(Submission).isRequired,
	onChange: React.PropTypes.func.isRequired,
	onSubmit: React.PropTypes.func.isRequired
};

module.exports = EditorBox;
