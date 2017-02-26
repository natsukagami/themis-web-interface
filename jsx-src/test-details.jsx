import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

class TestItem extends React.Component {
	render() {
		return <ListGroupItem id={`test-${this.props.id}`}>
			<div>
				<span>{this.props.id}: <b>{Math.round(this.props.score * 1000) / 1000}</b></span>
				<span className='pull-right'>Thời gian chạy: {Math.round(this.props.time * 1000) / 1000} giây</span>
			</div>
			<hr/>
			<pre style={{whiteSpace: 'pre-wrap'}}>{this.props.verdict}</pre>
		</ListGroupItem>;
	}
}
TestItem.propTypes = {
	id: React.PropTypes.string.isRequired,
	verdict: React.PropTypes.string.isRequired,
	time: React.PropTypes.number.isRequired,
	score: React.PropTypes.number.isRequired
};

class TestDetails extends React.Component {
	render() {
		if (!this.props.results) return null;
		if (this.props.verdict === 'Yes') {
			return <h5 className='text-center'>Bài của bạn đã được chấm.</h5>;
		}
		if (this.props.verdict === '') {
			return <h5 className='text-center'>Bài của bạn đang trong queue...</h5>;
		}
		if (typeof this.props.results === 'string')
			return <div id='compile-error'>
				<h4>Biên dịch gặp lỗi</h4>
				<pre>{this.props.results}</pre>
			</div>;
		return <div>
			<h4>Kết quả chấm</h4>
			<ListGroup>
				{this.props.results.map(test => {
					return <TestItem {...test} key={test.id} />;
				})}
			</ListGroup>
		</div>;
	}
}
TestDetails.propTypes = {
	results: React.PropTypes.oneOfType([
		React.PropTypes.arrayOf(React.PropTypes.shape({
			id: React.PropTypes.string.isRequired,
			verdict: React.PropTypes.string.isRequired,
			score: React.PropTypes.number.isRequired,
			time: React.PropTypes.number.isRequired
		})),
		React.PropTypes.string // Compile Error Message
	]),
	verdict: React.PropTypes.string.isRequired
};

module.exports = TestDetails;
