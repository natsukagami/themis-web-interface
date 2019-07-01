import React from 'react'
import { ISubmission, filenameOf, extTable } from '../../controls/submission'
import { connect } from 'react-redux'
import { RootState } from '../reducers'
import { removeSubmission, selectSubmission } from '../actions/submissions'
import { ListGroupItem, Button } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import JudgeIcon from './JudgeIcon'

interface ItemProps {
  submission: ISubmission
  isActive: boolean

  onRemove: () => void
  onSelect: () => void
}

/**
 * A list item.
 * @param submission The submission to display
 */
const SubmissionListItem = connect<
  {},
  Pick<ItemProps, 'onRemove' | 'onSelect'>,
  Pick<ItemProps, 'submission' | 'isActive'>,
  RootState
>(
  undefined,
  (dispatch, ownProps) => ({
    onRemove: () =>
      dispatch(removeSubmission({ filename: filenameOf(ownProps.submission) })),
    onSelect: () =>
      dispatch(selectSubmission({ filename: filenameOf(ownProps.submission) }))
  })
)(StaticItem)
export default SubmissionListItem

/**
 * promptRemove adds a wrapper to display a prompt on deletion.
 */
function promptRemove (onRemove: () => void): (e: React.MouseEvent) => void {
  return e => {
    e.stopPropagation()
    if (confirm('Bạn có muốn xóa bài làm không?')) onRemove()
  }
}

function StaticItem ({ submission, onRemove, onSelect, isActive }: ItemProps) {
  return (
    <ListGroupItem active={isActive} onClick={onSelect}>
      {/* Delete button */}
      <Button color='danger' onClick={promptRemove(onRemove)}>
        <FontAwesomeIcon icon='times-circle' />
      </Button>

      {/* The submission's name, click on it to get to the submission*/}
      <span>{` ${submission.filename}.${extTable[submission.lang]} `}</span>

      {/* Display judge results briefly */}
      {submission.saveStatus === 'submitted' ? (
        <JudgeIcon
          saveStatus={submission.saveStatus}
          verdict={
            submission.result ? submission.result.verdict.toString() : undefined
          }
        />
      ) : null}
    </ListGroupItem>
  )
}
