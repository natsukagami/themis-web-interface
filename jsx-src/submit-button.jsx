import React from 'react';
import { Button } from 'react-bootstrap';

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
		return <Button
			bsStyle='success'
			className='form-control'
			disabled={this.state.disabled}
			onClick={() => this.onClick()}
		>Nộp bài</Button>;
	}
}
SubmitButton.propTypes = {
	saveStatus: React.PropTypes.string.isRequired,
	onSubmit: React.PropTypes.func.isRequired
};

module.exports = SubmitButton;