import React from 'react'
import { ListGroupItem, Button, ListGroup } from 'reactstrap'
import { connect } from 'react-redux'
import { RootState } from '../reducers'
import { files } from '../actions/files'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface FileItemProp {
  id: string
  name: string
}

/**
 * FileItem is a list item for the Files collection. Each can be clicked on
 * to download the requested file.
 */
function FileItem ({ id, name }: FileItemProp) {
  return (
    <a href={`/files/${id}`}>
      <ListGroupItem>{name}</ListGroupItem>
    </a>
  )
}

interface Props {
  files: { [id: string]: string }
  disableRefresh: boolean
  onRefresh: () => void
}

/** Displays the list of downloadable files */
const Files = connect<
  Pick<Props, 'files' | 'disableRefresh'>,
  Pick<Props, 'onRefresh'>,
  {},
  RootState
>(
  state => ({
    files: state.files.list,
    disableRefresh: state.files.status === 'loading'
  }),
  dispatch => ({
    onRefresh: () => dispatch(files.request())
  })
)(StaticFiles)
export default Files

function StaticFiles ({ files, onRefresh }: Props) {
  return (
    <div>
      <h4>
        Tải xuống
        <span className='float-md-right'>
          <Button size='sm' color='info' onClick={onRefresh}>
            <FontAwesomeIcon icon='sync' />
          </Button>
        </span>
      </h4>
      <ListGroup>
        {Object.keys(files).map(key => (
          <FileItem key={key} id={key} name={files[key]} />
        ))}
        {!Object.keys(files).length ? (
          <ListGroupItem>Không có file nào</ListGroupItem>
        ) : null}
      </ListGroup>
    </div>
  )
}
