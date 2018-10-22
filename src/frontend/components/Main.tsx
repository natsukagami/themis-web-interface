import React from 'react'
import { ISubmission } from '../../controls/submission'
import Editor from './Editor'
import TestDetails from './TestResults'
import { connect } from 'react-redux'
import { RootState } from '../reducers'

interface Props {
  submission: ISubmission | null
}

/**
 * The main screen.
 */
const Main = connect<Props, {}, {}, RootState>(state => {
  if (state.submissions.selected === null) return { submission: null }
  return { submission: state.submissions.list[state.submissions.selected] }
})(StaticMain)
export default Main

function StaticMain ({ submission }: Props) {
  if (submission === null) {
    return (
      <h3 className='text-center'>Mở hoặc tạo một file mới để tiếp tục</h3>
    )
  }

  return (
    <div>
      <Editor />
      <TestDetails
        saveStatus={submission.saveStatus}
        result={submission.result}
      />
    </div>
  )
}
