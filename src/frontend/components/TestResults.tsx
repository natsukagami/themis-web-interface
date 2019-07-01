import React from 'react'
import { Test, LogContent } from '../../controls/judgelog'
import { ListGroupItem, ListGroup, Card } from 'reactstrap'
import { SaveStatus } from '../../controls/submission'
import { connect } from 'react-redux'
import { RootState } from '../reducers'

interface Props {
  saveStatus: SaveStatus
  result?: LogContent
  queue: number
}

/**
 * Displays the list of test results.
 */
const TestDetails = connect<
  Pick<Props, 'queue'>,
  {},
  Pick<Props, 'saveStatus' | 'result'>,
  RootState
>(state => ({ queue: state.queue.items }))(StaticTestDetails)
export default TestDetails

function StaticTestDetails ({ saveStatus, result, queue }: Props) {
  if (saveStatus !== 'submitted') return null

  if (result === undefined) {
    return (
      <h5 className='text-center'>
        Bài của bạn đang được chấm ({queue} bài đang chờ)...
      </h5>
    )
  }

  if (result.verdict === 'Yes') {
    return (
      <h5 className='text-center'>
        Bài của bạn đã được chấm. Tuy nhiên, kết quả không được công bố.
      </h5>
    )
  }

  if (typeof result.details === 'string') {
    return (
      <div>
        <h4>Biên dịch gặp lỗi</h4>
        <pre>{result.details}</pre>
      </div>
    )
  }

  return (
    <div>
      <hr />
      <h4 className='row justify-content-between'>
        <span>Kết quả chấm</span>
        <span>
          Điểm của bạn: <b>{result.verdict}</b>
        </span>
      </h4>
      <ListGroup>
        {result.details.map(test => {
          return <TestItem {...test} key={test.id} />
        })}
      </ListGroup>
    </div>
  )
}

/**
 * Displays the test item result as a list object.
 */
function TestItem ({ id, verdict, time, score }: Test) {
  return (
    <ListGroupItem>
      <div className='row justify-content-between' style={{ padding: 10 }}>
        <span>
          {id}:{' '}
          <span className='font-weight-bold'>
            {Math.round(score * 1000) / 1000}
          </span>
        </span>
        <span>
          Thời gian chạy:{' '}
          <span className='font-weight-bold'>
            {Math.round(time * 1000) / 1000}
          </span>{' '}
          giây
        </span>
      </div>
      <Card body color='light'>
        <samp style={{ whiteSpace: 'pre-wrap' }}>{verdict}</samp>
      </Card>
    </ListGroupItem>
  )
}
