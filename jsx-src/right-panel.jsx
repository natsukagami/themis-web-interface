const React = require('react');
const bs = require('react-bootstrap');

class TestItem extends React.Component {
	render() {
		return <a
			href={`#test-${this.props.id}`}
			className='list-group-item'
			title={this.props.verdict}
		>
			{this.props.id}
			<bs.Badge>{this.props.score}</bs.Badge>
		</a>;
	}
}
TestItem.propTypes = {
	id: React.PropTypes.string.isRequired,
	verdict: React.PropTypes.string.isRequired,
	score: React.PropTypes.number.isRequired
};

class LastSubmit extends React.Component {
	render() {
		if (this.props.verdict === '') return null;
		let tests = null;
		if (typeof this.props.results === 'string') {
			tests = <div className='text-center'><h4>Lần nộp cuối: <div><b><a href='#compile-error'>{this.props.verdict}</a></b></div></h4></div>;
		} else {
			tests = <div>
				<h4>Lần nộp cuối: <b>{this.props.verdict}</b></h4>
				<div className='list-group'>
					{this.props.results.map(test => <TestItem
						id={test.id}
						verdict={test.verdict}
						score={test.score}
						key={test.id}
					/>)}
				</div>
			</div>;
		}
		return tests;
	}
}
LastSubmit.propTypes = {
	verdict: React.PropTypes.string.isRequired,
	results: React.PropTypes.oneOfType([
		React.PropTypes.arrayOf(React.PropTypes.shape({
			id: React.PropTypes.string.isRequired,
			verdict: React.PropTypes.string.isRequired,
			score: React.PropTypes.number.isRequired,
			time: React.PropTypes.number.isRequired
		})),
		React.PropTypes.string // Compile Error Message
	]).isRequired
};

class SubmitButton extends React.Component {
	constructor() {
		super();
		this.state = { disabled: false };
	}
	componentDidMount() {
		this.setState({ disabled: this.props.saveStatus === 'submitted' });
	}
	componentWillReceiveProps(newProps) {
		this.setState({ disabled: newProps.saveStatus === 'submitted' });
	}
	onClick() {
		this.setState({ disabled: true }, () => {
			this.props.onSubmit(() => this.setState({ disabled: false }));
		});
	}
	render() {
		return <bs.Button
			bsStyle='success'
			className='form-control'
			disabled={this.state.disabled}
			onClick={() => this.onClick()}
		>Nộp bài</bs.Button>;
	}
}
SubmitButton.propTypes = {
	saveStatus: React.PropTypes.string.isRequired,
	onSubmit: React.PropTypes.func.isRequired
};

class RightPanel extends React.Component {
	render() {
		return <div data-spy='affix' style={{width: '17%', overflowY: 'auto', maxHeight: '90%'}}>
			<SubmitButton saveStatus={this.props.saveStatus} onSubmit={this.props.onSubmit}/>
			<hr/>
			<LastSubmit verdict={this.props.verdict} results={this.props.results}/>
		</div>;
	}
}
RightPanel.propTypes = {
	verdict: React.PropTypes.string,
	results: React.PropTypes.oneOfType([
		React.PropTypes.arrayOf(React.PropTypes.shape({
			id: React.PropTypes.string.isRequired,
			verdict: React.PropTypes.string.isRequired,
			score: React.PropTypes.number.isRequired
		})),
		React.PropTypes.string // Compile Error Message
	]),
	saveStatus: React.PropTypes.string.isRequired,
	onSubmit: React.PropTypes.func.isRequired
};
RightPanel.defaultProps = {
	verdict: '',
	results: []
};

module.exports = RightPanel;
