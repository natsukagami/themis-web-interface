import React from 'react'
import reactDom from 'react-dom'

import FlipMove from 'react-flip-move'
import axios from 'axios'
import { Table, Button } from 'reactstrap'

import './fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Contestant {
  scores: { total: number; [problem: string]: number }
  name: string
  rank: number
}

interface State {
  problems: string[]
  contestants: Contestant[]
  lastUpdated: Date
  disableRefresh: boolean
}

/**
 * Class Main provides an entrance to the scoreboard.
 */
class Main extends React.Component<{}, State> {
  constructor (props: {}) {
    super(props)
    /**
     * Stores the current scoreboard.
     * @property state
     * @type {Array<User>}
     */
    this.state = {
      problems: [],
      contestants: [],
      lastUpdated: new Date(0),
      disableRefresh: false
    }
    this.fetch()
    setInterval(() => this.fetch(), 15000) // F5 every 15 seconds
  }
  /**
   * Fetches new list from the server.
   */
  async fetch () {
    try {
      const res = await axios.post<Pick<State, 'problems' | 'contestants'>>(
        '/scoreboard'
      )
      if (res.status !== 200) throw new Error(res.statusText)
      this.setState({ ...res.data, lastUpdated: new Date() })
    } catch (err) {
      console.log(err)
    }
  }
  /**
   * Handles manual refresh.
   */
  onRefresh () {
    this.fetch()
    this.setState({ disableRefresh: true })
    setTimeout(() => this.setState({ disableRefresh: false }), 1000) // Refresh again after 1 second please
  }

  render () {
    const probs = this.state.problems
    const table = (
      <Table bordered hover>
        <thead>
          <tr>
            <th rowSpan={2}>#</th>
            <th rowSpan={2}>Tên</th>
            <th rowSpan={2}>Tổng</th>
            <th colSpan={this.state.problems.length}>Điểm từng bài</th>
          </tr>
          <FlipMove typeName={'tr'}>
            {this.state.problems.map(prob => (
              <th key={prob}>{prob}</th>
            ))}
          </FlipMove>
        </thead>
        <FlipMove typeName={'tbody'}>
          {this.state.contestants.map(u => {
            return (
              <tr key={u.name} className={u.rank <= 3 ? 'success' : ''}>
                <td>{u.rank}</td>
                <td>{u.name}</td>
                <td>{u.scores.total}</td>
                {probs.map(p => (
                  <td>{u.scores[p] || 0}</td>
                ))}
              </tr>
            )
          })}
        </FlipMove>
      </Table>
    )
    return (
      <div>
        <div className='text-right'>
          Lần cập nhật cuối: {this.state.lastUpdated.toString()}
        </div>
        <div className='text-center'>
          <Button
            bsStyle='info'
            onClick={() => this.onRefresh()}
            disabled={this.state.disableRefresh}
          >
            <FontAwesomeIcon icon='sync' />
            Cập nhật
          </Button>
        </div>
        <hr />
        {table}
      </div>
    )
  }
}

reactDom.render(<Main />, document.getElementById('root'))
