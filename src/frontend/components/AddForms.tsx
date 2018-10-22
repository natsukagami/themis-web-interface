import React from 'react'
import {
  Lang,
  extTable,
  filenameOf,
  langTable,
  Ext
} from '../../controls/submission'
import { Form, Button, FormGroup, Input } from 'reactstrap'
import { RootState } from '../reducers'
import connectMore from './connect-more'
import {
  changeAddForm,
  changeUploadForm,
  uploadSubmission
} from '../actions/add-forms'
import { addSubmission } from '../actions/submissions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { basename, extname } from 'path'
import { Dispatch } from 'redux'

interface AddProps {
  filename: string
  lang: Lang
  available: string | true

  onFilenameChange: (filename: string) => void
  onLangChange: (lang: Lang) => void
  onSubmit: () => void
}

/**
 * A form to create empty new submissions.
 */
export const AddForm = connectMore<
  Pick<AddProps, 'filename' | 'lang' | 'available'>,
  Pick<AddProps, 'onFilenameChange' | 'onLangChange' | 'onSubmit'>,
  {},
  RootState
>(
  state => {
    const s = state.addForms.addForm
    let available: string | true = true
    if (s.filename === '') available = 'Tên không được phép rỗng'
    else if (
      state.submissions.list.some(v => filenameOf(v) === filenameOf(s))
    ) {
      available = 'File đã tồn tại'
    }
    return { ...s, available }
  },
  (dispatch, props) => ({
    onFilenameChange: filename =>
      dispatch(changeAddForm({ filename: filename.toUpperCase() })),
    onLangChange: lang => dispatch(changeAddForm({ lang })),
    onSubmit: () => {
      dispatch(addSubmission(props))
      dispatch(changeAddForm({ filename: '' }))
    }
  })
)(StaticAddForm)

function StaticAddForm ({
  filename,
  lang,
  onFilenameChange,
  onLangChange,
  onSubmit,
  available
}: AddProps) {
  return (
    <div>
      <h5>Tạo file mới</h5>
      <Form
        inline
        className='justify-content-between'
        onSubmit={prevented(onSubmit)}
      >
        <FormGroup>
          <Input
            type='text'
            placeholder='Tên bài'
            value={filename}
            onChange={e => onFilenameChange(e.target.value)}
            invalid={available !== true}
            title={available === true ? '' : available}
          />
        </FormGroup>
        <select
          className='form-control'
          value={lang}
          onChange={e => onLangChange(e.target.value as Lang)}
        >
          {Object.keys(extTable).map(v => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <Button type='submit' color='primary' disabled={available !== true}>
          <FontAwesomeIcon icon='check' />
        </Button>
      </Form>
    </div>
  )
}

interface UploadProps {
  file: File | null
  uploading: boolean
  available: string | true

  onFileChange: (f: File | null) => void
  onSubmit: () => void
}

/**
 * Upload Form
 */
export const UploadForm = connectMore<
  Pick<UploadProps, 'uploading' | 'file' | 'available'>,
  Pick<UploadProps, 'onFileChange' | 'onSubmit'>,
  {},
  RootState
>(
  state => ({
    ...state.addForms.uploadForm,
    available: checkFile(state.addForms.uploadForm.file, state)
  }),
  (dispatch, props) => ({
    onFileChange: (f: File | null) => dispatch(changeUploadForm({ file: f })),
    onSubmit: () => uploadSubmit(dispatch, props)
  })
)(StaticUploadForm)

/**
 * Perform upload
 */
function uploadSubmit (dispatch: Dispatch, { file }: { file: File | null }) {
  if (file === null) return // Won't happen

  dispatch(uploadSubmission.request())

  const filename = basename(file.name, extname(file.name)).toUpperCase()
  const ext = (extname(file.name) === ''
    ? ''
    : extname(file.name).slice(1)
  ).toLowerCase()

  const lang = langTable[ext as Ext]

  const fr = new FileReader()
  fr.onload = () => {
    dispatch(addSubmission({ filename, lang, content: fr.result as string }))
    dispatch(uploadSubmission.success())
  }
  fr.readAsText(file)
}

/**
 * Runs a bunch of checks whether a file meets certain conditions
 */
function checkFile (file: File | null, state: RootState): string | true {
  if (file === null) return 'File không được phép rỗng'

  const filename = basename(file.name, extname(file.name)).toUpperCase()
  const ext = (extname(file.name) === ''
    ? ''
    : extname(file.name).slice(1)
  ).toLowerCase()

  if (!(ext in langTable)) {
    // Unsupported language
    return 'Ngôn ngữ không được hỗ trợ: ' + ext
  }

  if (
    state.submissions.list.some(v => filenameOf(v) === filename + '.' + ext)
  ) {
    return 'File đã tồn tại trong danh sách'
  }

  if (file.size > 1024 * 1024) {
    return 'File quá lớn'
  }

  return true
}

function StaticUploadForm ({
  uploading,
  available,
  onFileChange,
  onSubmit
}: UploadProps) {
  return (
    <div>
      <h5>Tải lên file mới</h5>
      <Form
        inline
        className='justify-content-between'
        onSubmit={prevented(onSubmit)}
      >
        <FormGroup>
          <Input
            type='file'
            placeholder='Upload'
            onChange={e =>
              onFileChange(
                e.target.files === null ? null : e.target.files[0] || null
              )
            }
            invalid={available !== true}
            title={available === true ? '' : available}
          />
        </FormGroup>
        <Button
          type='submit'
          color='primary'
          disabled={uploading || available !== true}
        >
          <FontAwesomeIcon icon='upload' />
        </Button>
      </Form>
    </div>
  )
}

/**
 * Wraps a submit event handler with `preventDefault`
 */
function prevented (
  fn: () => void
): (e: React.FormEvent<HTMLFormElement>) => void {
  return e => {
    e.preventDefault()
    fn()
  }
}
