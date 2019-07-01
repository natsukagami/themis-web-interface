import React from 'react'
import SubmissionList from './SubmissionList'
import Files from './Files'
import { AddForm, UploadForm } from './AddForms'

/**
 * Renders the left menu.
 */
export default function LeftMenu () {
  return (
    <div>
      <SubmissionList />
      <hr />
      <AddForm />
      <br />
      <UploadForm />
      <hr />
      <Files />
    </div>
  )
}
