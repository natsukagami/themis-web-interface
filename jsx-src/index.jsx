import React from 'react';
import reactDom from 'react-dom';
import { Col, Row } from 'react-bootstrap';
const Submission = require('../controls/submission');

const LeftMenu = require('./left-menu.jsx');
const Editor = require('./editor.jsx');
const RightPanel = require('./right-panel.jsx');
const TestDetails = require('./test-details.jsx');

const axios = require('axios');

class Main extends React.Component {
	constructor() {
		super();
		// TODO: Dynamic state requests
		if (localStorage.getItem('username') !== window.username) {
			this.state = {
				submissions: [],
				selected: null
			};
		} else {
			this.state = {
				submissions: JSON.parse(localStorage.getItem('submissions')).map(item => new Submission(item)),
				selected: Number(localStorage.getItem('selected'))
			};
		}
	}
	componentDidUpdate() {
		localStorage.setItem('username', window.username);
		localStorage.setItem('submissions', JSON.stringify(this.state.submissions));
		localStorage.setItem('selected', this.state.selected);
	}
	componentDidMount() {
		this.componentDidUpdate();
	}
	// Help functions
	/**
	 * Changes code of current file. Used in Editor element.
	 */
	codeEdit(value) {
		const newSubmissions = this.state.submissions.slice();
		const curSelected = this.state.selected;
		newSubmissions[curSelected].content = value;
		newSubmissions[curSelected].saveStatus = 'saved';
		return this.setState({ submissions: newSubmissions });
	}
	/**
	 * Changes currently selected file.
	 */
	selectedChange(id) {
		return this.setState({ selected: id });
	}
	/**
	 * Deletes the selected submission.
	 */
	deleteSub(id) {
		let newSubmissions = this.state.submissions.slice();
		newSubmissions.splice(id, 1);
		let newSelected = this.state.selected;
		if (newSelected === id) newSelected = 0;
		if (newSelected > id) --newSelected;
		if (newSubmissions.length === 0) newSelected = null;
		return this.setState({ selected: newSelected, submissions: newSubmissions });
	}
	/**
	 * Adds a new submission
	 */
	addSub(sub) {
		const newSub = this.state.submissions.slice();
		newSub.push(sub);
		return this.setState({ submissions: newSub, selected: newSub.length - 1 });
	}
	/**
	 * Updates the result of a submission
	 */
	updateResults(id, results) {
		const newSub = this.state.submissions.slice();
		newSub[id].result = results;
		return this.setState({ submissions: newSub });
	}
	/**
	 * Submits the current submission
	 */
	submit(callback) {
		const curSub = this.state.submissions[this.state.selected];
		axios.post('/submit', {
			problem: curSub.filename,
			ext: { 'C++': '.cpp', Pascal: '.pas', Python: '.py' }[curSub.ext],
			content: curSub.content
		})
		.then(({ status, data }) => {
			if (status !== 200 || data !== true) return Promise.reject(new Error('Submit failed'));
			const newSub = this.state.submissions.slice();
			newSub[this.state.selected].saveStatus = 'submitted';
			newSub[this.state.selected].result = {};
			return this.setState({ submissions: newSub });
		})
		.catch(() => {
			return alert('Lỗi nộp bài, hãy thử lại!'), callback();
		});
	}
	render() {
		let centerRight = null;
		if (this.state.selected !== null && this.state.selected < this.state.submissions.length) {
			centerRight = <div><Col sm={7}>
				<Editor submission={this.state.submissions[this.state.selected]} onChange={(value) => this.codeEdit(value)}/>
				<hr/>
				<TestDetails results={this.state.submissions[this.state.selected].result.details} />
			</Col>
			<Col sm={2}>
				<RightPanel
					verdict={this.state.submissions[this.state.selected].result.verdict}
					results={this.state.submissions[this.state.selected].result.details}
					saveStatus={this.state.submissions[this.state.selected].saveStatus}
					onSubmit={cb => this.submit(cb)}
				/>
			</Col></div>;
		}
		return <Row>
			<Col sm={3}>
				<LeftMenu
					submissions={this.state.submissions}
					selected={this.state.selected}
					onSelect={(id) => this.selectedChange(id)}
					onDelete={(id) => this.deleteSub(id)}
					onAdd={(sub) => this.addSub(sub)}
					onUpdate={(id, results) => this.updateResults(id, results)}
				/>
			</Col>
			{centerRight}
		</Row>;
	}
}

reactDom.render(<div className='container-fluid'><Main/></div>, document.getElementById('root'));
