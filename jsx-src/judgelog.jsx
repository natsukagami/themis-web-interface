import React from 'react';
import { Image } from 'react-bootstrap';
const path = require('path');
const axios = require('axios');

class JudgeLog extends React.Component {
	constructor() {
		super();
		this.lastUpdated = new Date(0);
		this.timer = setInterval(() => {
			axios.post('log', {
				user: window.username,
				problem: path.basename(this.props.name, path.extname(this.props.name)),
				ext: path.extname(this.props.name)
			})
			.then(({ status, data }) => {
				if (status !== 200) return Promise.reject(new Error());
				this.handleUpdate(data);
			})
			.catch(() => { // Pass
			});
		}, 5000); // every 5 seconds
	}
	handleUpdate(results) {
		if (results === null) return;
		results.created = new Date(results.created);
		if (this.lastUpdated.getTime() >= results.created.getTime()) return;
		this.lastUpdated = results.created;
		this.props.updateResults(results.content);
	}
	componentWillUnmount() {
		clearInterval(this.timer);
	}
	render() {
		if (this.props.verdict === '')
			return <Image responsive src='/public/img/giphy.gif' height='16' width='16'/>;
		else return <span style={{fontSize: '80%'}}>{this.props.verdict}</span>;
	}
}
JudgeLog.propTypes = {
	name: React.PropTypes.string.isRequired,
	updateResults: React.PropTypes.func.isRequired,
	verdict: React.PropTypes.string
};
JudgeLog.defaultProps = {
	verdict: ''
};

module.exports = JudgeLog;
