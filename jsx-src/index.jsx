import React from 'react';
import reactDom from 'react-dom';
import { Col, Row } from 'react-bootstrap';

const LeftMenu = require('./left-menu.jsx');
const Editor = require('./editor.jsx');
const TestDetails = require('./test-details.jsx');
const LC = require('./localstorage.jsx');

const axios = require('axios');

const Submission = require('../controls/submission');

class Main extends React.Component {
	constructor() {
		super();
		// if (localStorage.getItem('username') !== window.username) {
		// 	this.state = {
		// 		submissions: [],
		// 		selected: null
		// 	};
		// } else {
		// 	this.state = {
		// 		submissions: JSON.parse(localStorage.getItem('submissions')).map(item => new Submission(item)),
		// 		selected: Number(localStorage.getItem('selected'))
		// 	};
		// }
		LC.User = window.username;
		this.state = {
			submissions: LC.submissions,
			selected: LC.selected
		};
	}
	componentDidUpdate() {
		LC.submissions = this.state.submissions;
		LC.selected = this.state.selected;
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
			ext: '.' + Submission.ext[curSub.ext],
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
			centerRight = <div>
				<Col sm={9}>
					<Editor
						submission={this.state.submissions[this.state.selected]}
						onChange={(value) => this.codeEdit(value)}
						onSubmit={cb => this.submit(cb)}
					/>
					<hr/>
					<TestDetails results={this.state.submissions[this.state.selected].result.details} />
				</Col>
			</div>;
		}
		return <Row>
			<Col md={3}>
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

reactDom.render(<Main/>, document.getElementById('root'));
