import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

/**
 * The submit button. It is disabled when the code is already submitted.
 * @class SubmitButton
 * @param {string}   saveStatus The code's submit status.
 * @param {Function} onSubmit   The submit event handler.
 * @property {boolean} disabled Whether the button should be disabled.
 */
class SubmitButton extends React.Component {
	constructor() {
		super();
		this.state = { disabled: false };
	}
	// update the state on load.
	componentDidMount() {
		this.setState({ disabled: this.props.saveStatus === 'submitted' });
	}
	// update the state on any change.
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
	saveStatus: PropTypes.string.isRequired,
	onSubmit: PropTypes.func.isRequired
};

module.exports = SubmitButton;
