import React from 'react'
import Ace from 'react-ace'
// TODO: How to reduce size of code by removing this but retain C++ functionality?
import 'brace'
import {
  ISubmission as Submission,
  Lang,
  filenameOf,
  SaveStatus
} from '../../controls/submission'
import { RootState } from '../reducers'
import { editSubmission, submit } from '../actions/submission'
import connectMore from './connect-more'
import { Button } from 'reactstrap'

require('brace/mode/c_cpp')
require('brace/mode/pascal')
require('brace/mode/python')
require('brace/mode/java')
require('brace/theme/monokai')

interface EditorBoxProp {
  submission: Submission
  onChange: (content: string) => void
}

const modes: { [lang in Lang]: string } = {
  'C++': 'c_cpp',
  Pascal: 'pascal',
  Python: 'python',
  Java: 'java'
}

/**
 * Use ace / brace editor as the code editor.
 */
function StaticEditorBox ({ submission, onChange }: EditorBoxProp) {
  return (
    <Ace
      style={{ width: '100%' }}
      mode={modes[submission.lang]}
      theme='monokai'
      name='editor'
      onChange={onChange}
      value={submission.content}
      editorProps={{ $blockScrolling: true }}
    />
  )
}

const EditorBox = connectMore<
  Pick<EditorBoxProp, 'submission'>,
  Pick<EditorBoxProp, 'onChange'>,
  {},
  RootState
>(
  state => ({
    submission: state.submissions.list[state.submissions.selected as number]
  }),
  (dispatch, stateProps) => ({
    onChange: v =>
      dispatch(
        editSubmission({
          filename: filenameOf(stateProps.submission),
          content: v
        })
      )
  })
)(StaticEditorBox)

interface Prop {
  saveStatus: SaveStatus
  onSubmit: () => void
}

/**
 * Editor wraps the ace editor within a div, that also contains a submit
 * button.
 */
function StaticEditor ({ saveStatus, onSubmit }: Prop) {
  return (
    <div>
      <h4 className='row justify-content-between'>
        <span>Soạn code</span>
        <span>
          <Button
            color='success'
            className='form-control'
            disabled={saveStatus !== 'saved'}
            onClick={onSubmit}
          >
            {saveStatus === 'saved'
              ? 'Nộp bài'
              : saveStatus === 'submitting'
                ? 'Đang nộp bài...'
                : 'Đã nộp bài'}
          </Button>
        </span>
      </h4>
      <EditorBox />
    </div>
  )
}

const Editor = connectMore<
  { submission: Submission },
  Pick<Prop, 'onSubmit'>,
  {},
  Prop,
  RootState
>(
  state => ({
    submission: state.submissions.list[state.submissions.selected as number]
  }),
  (dispatch, stateProps) => ({
    onSubmit: () =>
      dispatch(submit.request({ filename: filenameOf(stateProps.submission) }))
  }),
  (stateProps, dispatchProps) => ({
    saveStatus: stateProps.submission.saveStatus,
    onSubmit: dispatchProps.onSubmit
  })
)(StaticEditor)
export default Editor
