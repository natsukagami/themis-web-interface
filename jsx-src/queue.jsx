import React from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { refresh, load } from './data/queue';

/**
 * Receives judge queue information and displays the size of the judge queue.
 * @class Queue
 */
class Queue extends React.Component {
	// Loads the reload clock on mount.
	componentWillMount() {
		this.props.refresh();
		this.props.load();
	}
	render() {
		return <div>
			<h5>
				Số bài trong queue: <b>{this.props.count}</b>
				<span className='pull-right'><Button bsSize='xs' bsStyle='info' onClick={() => this.props.refresh()} disabled={this.props.disableRefresh}>
					<Glyphicon glyph='refresh' />
				</Button></span>
			</h5>
		</div>;
	}
}

Queue.propTypes = {
	refresh: PropTypes.func.isRequired,
	load: PropTypes.func.isRequired,
	disableRefresh: PropTypes.bool.isRequired,
	count: PropTypes.number.isRequired
};

module.exports = connect(
	state => {
		return {
			count: state.queue.count,
			disableRefresh: (new Date() - state.queue.lastRefreshed) < 1000,
		}
	},
	dispatch => {
		return {
			load: () => dispatch(load()),
			refresh: () => dispatch(refresh())
		}
	}
)(Queue);
module.exports.Queue = Queue;
