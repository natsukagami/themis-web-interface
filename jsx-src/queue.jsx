import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
const axios = require('axios');

/**
 * Receives judge queue information and displays the size of the judge queue.
 * @class Queue
 * @property {Number} count The received size of the queue.
 */
class Queue extends React.Component {
	constructor() {
		super();
		this.state = {
			count: 0
		};
		this.fetch();
		setInterval(() => { this.fetch(); }, 15000);
	}
	// Fetches queue information from the server.
	fetch() {
		return axios.post('/queue')
		.then(response => {
			if (response.status !== 200) return;
			this.setState({ count: Number(response.data) });
		})
		.catch(() => { // Pass error
		});
	}
	// Handles manual refresh.
	onRefresh() {
		this.fetch();
		this.setState({ disableRefresh: true });
		setTimeout(() => this.setState({ disableRefresh: false }), 1000); // Refresh again after 1 second please
	}
	render() {
		return <div>
			<h5>
				Số bài trong queue: <b>{this.state.count}</b>
				<span className='pull-right'><Button bsSize='xs' bsStyle='info' onClick={() => this.onRefresh()} disabled={this.state.disableRefresh}>
					<Glyphicon glyph='refresh'/>
				</Button></span>
			</h5>
		</div>;
	}
}

module.exports = Queue;
