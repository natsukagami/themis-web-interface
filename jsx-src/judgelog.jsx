const React = require('react');
const bs = require('react-bootstrap');
const rq = require('request-json');
const path = require('path');

class JudgeLog extends React.Component {
	constructor() {
		super();
		this.client = rq.createClient(location.protocol + '//' + location.host);
		this.lastUpdated = new Date(0);
		this.timer = setInterval(() => {
			this.client.post('log', {
				user: window.username,
				problem: path.basename(this.props.name, path.extname(this.props.name)),
				ext: path.extname(this.props.name)
			}, (err, res, body) => {
				if (err || res.statusCode !== 200) return;
				this.handleUpdate(body);
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
			return <bs.Image responsive src='/public/img/giphy.gif' height='16' width='16'/>;
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
