import React from 'react';
const axios = require('axios');
const countdown = require('countdown');
countdown.setLabels(
	' mili-giây| giây| phút| giờ| ngày| tuần| tháng| năm| thập kỉ| thế kỉ| thiên niên kỉ',
	' mili-giây| giây| phút| giờ| ngày| tuần| tháng| năm| thập kỉ| thế kỉ| thiên niên kỉ',
	' và ',
	', ',
	'ngay bây giờ'
);

class ContestClock extends React.Component {
	constructor() {
		super();
		this.state = {};
		axios.get('/contest')
			.then(response => {
				if (response.status !== 200) return;
				this.setState({
					startTime: new Date(response.data.startTime),
					endTime: new Date(response.data.endTime),
					now: new Date()
				});
				setInterval(() => this.setState({ now: new Date() }), 1000);
			})
			.catch(() => { }); 
	}
	render() {
		if (!this.state.startTime) return null;
		const now = this.state.now;
		let ret = null;
		if (this.state.startTime > now)
			ret = <h4>
				Cuộc thi sẽ bắt đầu trong <b>{countdown(now, this.state.startTime).toString()}</b>.
			</h4>;
		else if (this.state.endTime > now)
			ret = <h4>
				Cuộc thi sẽ kết thúc sau <b>{countdown(now, this.state.endTime).toString()}</b>.
			</h4>;
		else ret = <h4>Cuộc thi đã kết thúc.</h4>;
		return <div>{ret}<hr /></div>;
	}
}

module.exports = ContestClock;