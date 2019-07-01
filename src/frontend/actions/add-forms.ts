import { createStandardAction, createAsyncAction } from 'typesafe-actions'
import { Lang } from '../../controls/submission'

/**
 * Change the add form
 */
export const changeAddForm = createStandardAction('CHANGE_ADD_FORM')<
  | {
    filename: string;
  }
  | { lang: Lang }
>()

/**
 * Change the upload form
 */
export const changeUploadForm = createStandardAction('CHANGE_UPLOAD_FORM')<{
  file: File | null;
}>()

export const uploadSubmission = createAsyncAction(
  'UPLOAD_REQUEST',
  'UPLOAD_SUCCESS',
  'UPLOAD_FAILURE'
)<void, void, never>()
