import { Lang } from '../../controls/submission'
import RootAction from '../actions'
import { Reducer, combineReducers } from 'redux'

type Action = RootAction

interface AddForms {
  addForm: AddForm
  uploadForm: UploadForm
}

interface AddForm {
  filename: string
  lang: Lang
}

interface UploadForm {
  file: File | null
  uploading: boolean
}

/**
 * Reduce the add form.
 */
const reduceAddForm: Reducer<AddForm, Action> = (
  form = { filename: '', lang: 'C++' },
  action
) => {
  if (action.type === 'CHANGE_ADD_FORM') {
    return { ...form, ...action.payload }
  }
  return form
}

/**
 * Reduce the upload form.
 */
const reduceUploadForm: Reducer<UploadForm, Action> = (
  form = { file: null, uploading: false },
  action
) => {
  switch (action.type) {
    case 'CHANGE_UPLOAD_FORM':
      return { ...form, ...action.payload }
    case 'UPLOAD_REQUEST':
      return { ...form, uploading: true }
    case 'UPLOAD_SUCCESS':
      return { ...form, uploading: false }
  }
  return form
}

const reduceAddForms = combineReducers<AddForms, Action>({
  addForm: reduceAddForm,
  uploadForm: reduceUploadForm
})
export default reduceAddForms
