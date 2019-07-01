import React, { Component } from 'react'
import countdown from 'countdown'
import { connect } from 'react-redux'
import { RootState } from '../reducers'
countdown.setLabels(
  ' mili-giây| giây| phút| giờ| ngày| tuần| tháng| năm| thập kỉ| thế kỉ| thiên niên kỉ',
  ' mili-giây| giây| phút| giờ| ngày| tuần| tháng| năm| thập kỉ| thế kỉ| thiên niên kỉ',
  ' và ',
  ', ',
  'ngay bây giờ'
)

function timeStr (x: ReturnType<typeof countdown>): string {
  return typeof x === 'number' ? x.toString() : x.toString()
}

type Prop = {
  clock: {
    startTime: Date;
    endTime: Date;
  } | null;
}

interface State {
  now: Date
}

/**
 * ContestClock is an element that display the time until the beginning / end
 * of the contest.
 * The element's data is independant, as it is directly pulled from the server.
 * Its data includes only the dates of the contest time.
 */
class StaticContestClock extends Component<Prop, State> {
  private timer = setInterval(() => this.setState({ now: new Date() }), 1000)
  readonly state = {
    now: new Date()
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  render () {
    if (!this.props.clock) return null

    const { startTime, endTime } = this.props.clock
    const { now } = this.state

    let ret = null
    if (startTime > now) {
      ret = (
        <h4>
          Cuộc thi sẽ bắt đầu trong <b>{timeStr(countdown(now, startTime))}</b>.
        </h4>
      )
    } else if (endTime > now) {
      ret = (
        <h4>
          Cuộc thi sẽ kết thúc sau <b>{timeStr(countdown(now, endTime))}</b>
        </h4>
      )
    } else ret = <h4>Cuộc thi đã kết thúc.</h4>
    return (
      <div>
        {ret}
        <hr />
      </div>
    )
  }
}

const ContestClock = connect<Prop, {}, {}, RootState>(state => ({
  clock: state.contestClock
}))(StaticContestClock)
export default ContestClock
