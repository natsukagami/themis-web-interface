import PropTypes from 'prop-types';
import React from 'react';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { refresh, load } from './data/files';
import { connect } from 'react-redux';

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
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired
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
	/**
	 * Loads the reload clock on mount.
	 */
	componentWillMount() {
		this.props.refresh();
		this.props.load();
	}
	render() {
		return <div>
			<h4>
				Tải xuống
				<span className='pull-right'><Button bsSize='xs' bsStyle='info' onClick={() => this.props.refresh()} disabled={this.props.disableRefresh}>
					<Glyphicon glyph='refresh' />
				</Button></span>
			</h4>
			<div>
				<ListGroup>
					{Object.keys(this.props.files).map(key => <FileItem key={key} id={key} name={this.props.files[key]} />)}
					{(!Object.keys(this.props.files).length ? <ListGroupItem>Không có file nào</ListGroupItem> : null)}
				</ListGroup>
			</div>
		</div>;
	}
}

FileServer.propTypes = {
	refresh: PropTypes.func.isRequired,
	load: PropTypes.func.isRequired,
	disableRefresh: PropTypes.bool.isRequired,
	files: PropTypes.object.isRequired
};

module.exports = connect(
	state => {
		return {
			files: state.files.files,
			disableRefresh: (new Date() - state.files.lastRefreshed) < 1000,
		}
	},
	dispatch => {
		return {
			load: () => dispatch(load()),
			refresh: () => dispatch(refresh())
		}
	}
)(FileServer);
module.exports.FileServer = FileServer;
