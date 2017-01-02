import React from 'react';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
const axios = require('axios');

class FileItem extends React.Component {
	render() {
		return <ListGroupItem href={`/files/${this.props.id}`}>{this.props.name}</ListGroupItem>;
	}
}
FileItem.propTypes = {
	id: React.PropTypes.string.isRequired,
	name: React.PropTypes.string.isRequired
};

class FileServer extends React.Component {
	constructor() {
		super();
		this.state = {
			files: {},
			disableRefresh: false
		};
		this.fetchFiles();
	}
	fetchFiles() {
		return axios.get('/files')
		.then(response => {
			if (response.status !== 200) return;
			this.setState({ files: response.data });
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
			<h4>
				Các tệp
				<span className='pull-right'><Button bsSize='xs' bsStyle='info' onClick={() => this.onRefresh()} disabled={this.state.disableRefresh}>
					<Glyphicon glyph='refresh'/>
				</Button></span>
			</h4>
			<div>
				<ListGroup>
					{Object.keys(this.state.files).map(key => <FileItem key={key} id={key} name={this.state.files[key]}/>)}
					{(!Object.keys(this.state.files).length ? <ListGroupItem>Không có file nào</ListGroupItem> : null)}
				</ListGroup>
			</div>
		</div>;
	}
}

module.exports = FileServer;
