import React from 'react';
import reactDom from 'react-dom';
import { Table, Button, Glyphicon } from 'react-bootstrap';
import FlipMove from 'react-flip-move';
const axios = require('axios');

/**
 * Class Main provides an entrance to the scoreboard.
 */
class Main extends React.Component {
	constructor() {
		super();
		/**
		 * Stores the current scoreboard.
		 * @property state
		 * @type {Array<User>}
		 */
		this.state = { problems: [], contestants: [], lastUpdated: new Date(0) };
		this.fetch();
		setInterval(() => this.fetch(), 15000); // F5 every 15 seconds
	}
	/**
	 * Fetches new list from the server.
	 */
	fetch() {
		return axios.post('/scoreboard')
		.then(response => {
			if (response.status !== 200) return;
			this.setState(Object.assign({}, response.data, { lastUpdated: new Date() }));
		})
		.catch(() => { // Pass error
		});
	}
	/**
	 * Handles manual refresh.
	 */
	onRefresh() {
		this.fetch();
		this.setState({ disableRefresh: true });
		setTimeout(() => this.setState({ disableRefresh: false }), 1000); // Refresh again after 1 second please
	}
	render() {
		const probs = this.state.problems;
		const table = <Table bordered hover>
			<thead>
				<tr>
					<th rowSpan={2}>#</th>
					<th rowSpan={2}>Tên</th>
					<th rowSpan={2}>Tổng</th>
					<th colSpan={this.state.problems.length}>Điểm từng bài</th>
				</tr>
				<FlipMove typeName={'tr'}>
					{this.state.problems.map(prob => <th key={prob}>{prob}</th>)}
				</FlipMove>
			</thead>
			<FlipMove typeName={'tbody'}>
				{this.state.contestants.map(u => {
					return <tr key={u.name} className={(u.rank <= 3 ? 'success' : '')}>
						<td>{u.rank}</td>
						<td>{u.name}</td>
						<td>{u.total}</td>
						{probs.map(p => <td>{u[p] || 0}</td>)}
					</tr>;
				})}	
			</FlipMove>
		</Table>;
		return <div>
			<div className='text-right'>Lần cập nhật cuối: {this.state.lastUpdated.toString()}</div>
			<div className='text-center'>
				<Button  bsStyle='info' onClick={() => this.onRefresh()} disabled={this.state.disableRefresh}>
					<Glyphicon glyph='refresh'/>Cập nhật
				</Button>
			</div>
			<hr/>
			{table}
		</div>;
	}
}

reactDom.render(<Main />, document.getElementById('root'));