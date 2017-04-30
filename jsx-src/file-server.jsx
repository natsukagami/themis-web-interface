import React from 'react';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
const axios = require('axios');

/**
 * FileItem is a list item for the Files collection. Each can be clicked on
 * to download the requested file.
 * @class FileItem
 * @param {string} id   The file's id
 * @param {string} name The file's name
 */
class FileItem extends React.Component {
	render() {
		return <ListGroupItem href={`/files/${this.props.id}`}>{this.props.name}</ListGroupItem>;
	}
}
FileItem.propTypes = {
	id: React.PropTypes.string.isRequired,
	name: React.PropTypes.string.isRequired
};

/**
 * FileServer is a collection of files displayed as a list. It also works
 * as a communication gate between server-served files and the user.
 * @class FileServer
 * @property {map<string, string>} files          The received files to be
 * rendered.
 * @property {boolean}             disableRefresh Whether refresh should be
 * disabled to avoid raiding the server.
 */
class FileServer extends React.Component {
	constructor() {
		super();
		this.state = {
			files: {},
			disableRefresh: false
		};
		this.fetchFiles();
	}
	/**
	 * Fetch the files from the server.
	 * @method fetchFiles
	 */
	fetchFiles() {
		return axios.get('/files')
		.then(response => {
			if (response.status !== 200) return;
			this.setState({ files: response.data });
		})
		.catch(() => { // Pass error
		});
	}
	/**
	 * Triggers a manual refresh, and starts a 1-second ban on manual refreshing.
	 * @method onRefresh
	 */
	onRefresh() {
		this.fetchFiles();
		this.setState({ disableRefresh: true });
		setTimeout(() => this.setState({ disableRefresh: false }), 1000); // Refresh again after 1 second please
	}
	render() {
		return <div>
			<h4>
				Tải xuống
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
