import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadContest } from './data/contest';
const countdown = require('countdown');
countdown.setLabels(
	' mili-giây| giây| phút| giờ| ngày| tuần| tháng| năm| thập kỉ| thế kỉ| thiên niên kỉ',
	' mili-giây| giây| phút| giờ| ngày| tuần| tháng| năm| thập kỉ| thế kỉ| thiên niên kỉ',
	' và ',
	', ',
	'ngay bây giờ'
);

/**
 * ContestClock is an element that display the time until the beginning / end
 * of the contest.
 * The element's data is independant, as it is directly pulled from the server.
 * Its data includes only the dates of the contest time.
 * @class ContestClock
 * @property {Date} startTime The contest's start time
 * @property {Date} endTime   The contest's end time
 * @property {Date} now       The last updated time of the element.
 */
class ContestClock extends React.Component {
	componentWillMount() {
		this.props.load();
	}
	render() {
		if (!this.props.startTime) return null;
		const now = this.props.now;
		let ret = null;
		if (this.props.startTime > now)
			ret = <h4>
				Cuộc thi sẽ bắt đầu trong <b>{countdown(now, this.props.startTime).toString()}</b>.
			</h4>;
		else if (this.props.endTime > now)
			ret = <h4>
				Cuộc thi sẽ kết thúc sau <b>{countdown(now, this.props.endTime).toString()}</b>.
			</h4>;
		else ret = <h4>Cuộc thi đã kết thúc.</h4>;
		return <div>{ret}<hr /></div>;
	}
}

ContestClock.propTypes = {
	now: PropTypes.instanceOf(Date),
	startTime: PropTypes.instanceOf(Date),
	endTime: PropTypes.instanceOf(Date),
	load: PropTypes.func
}

module.exports = connect(
	state => {
		if (state.contest.info !== null) {
			return { now: state.contest.now, startTime: state.contest.info.startTime, endTime: state.contest.info.endTime }
		}
		return { now: state.contest.now }
	},
	dispatch => {
		return {
			load: () => dispatch(loadContest())
		}
	}
)(ContestClock);
module.exports.ContestClock = ContestClock;
