import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
const axios = require('axios');

class Queue extends React.Component {
	constructor() {
		super();
		this.state = {
			count: 0
		};
		this.fetchFiles();
		setInterval(() => { this.fetchFiles(); }, 15000);
	}
	fetchFiles() {
		return axios.post('/queue')
		.then(response => {
			if (response.status !== 200) return;
			this.setState({ count: Number(response.data) });
		})
		.catch(() => { // Pass error
		});
	}
	onRefresh() {
		this.fetchFiles();
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
