import React from 'react'
import { ISubmission, filenameOf } from '../../controls/submission'
import { connect } from 'react-redux'
import { RootState } from '../reducers'
import FlipMove from 'react-flip-move'
import SubmissionListItem from './SubmissionsListItem'
import { ListGroup } from 'reactstrap'

interface Props {
  submissions: ISubmission[]
  selected: number | null
}

/**
 * Displays a list of submissions.
 */
const SubmissionList = connect<
  Pick<Props, 'submissions' | 'selected'>,
  {},
  {},
  RootState
>(state => ({
  submissions: state.submissions.list,
  selected: state.submissions.selected
}))(StaticList)
export default SubmissionList

function StaticList ({ submissions, selected }: Props) {
  return (
    <div>
      <h4>Các bài nộp</h4>
      <ListGroup style={{ position: 'relative' }}>
        <FlipMove typeName={null}>
          {submissions.map((v, id) => (
            <SubmissionListItem
              key={filenameOf(v)}
              submission={v}
              isActive={id === selected}
            />
          ))}
          {submissions.length === 0 ? (
            <li className='list-group-item' key={'empty'}>
              Không có file nào
            </li>
          ) : null}
        </FlipMove>
      </ListGroup>
    </div>
  )
}
