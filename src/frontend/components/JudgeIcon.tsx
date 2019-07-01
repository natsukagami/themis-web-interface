import React from 'react'
import { connect } from 'react-redux'
import { RootState } from '../reducers'
import { Badge } from 'reactstrap'
import { SaveStatus } from '../../controls/submission'

interface Props {
  saveStatus: SaveStatus
  verdict: undefined | string
}

/**
 * Displays a small judge icon on the side of the submission list.
 */
export default function JudgeIcon ({ saveStatus, verdict }: Props) {
  switch (saveStatus) {
    case 'saved':
      return <Badge color='info'>✓ Đã lưu</Badge>
    case 'submitting':
      return <Badge color='secondary'>Đang nộp</Badge>
  }

  if (!verdict) {
    return (
      <Badge>
        <img
          className='img-fluid'
          src='/public/img/giphy.gif'
          height='25'
          width='25'
        />
      </Badge>
    )
  } else if (verdict === 'Yes') {
    return (
      <Badge color='success'>
        <img
          className='img-fluid'
          src='/public/img/tick.png'
          height='25'
          width='25'
        />
      </Badge>
    )
  } else {
    return (
      <Badge color='success'>
        <span>{verdict}</span>
      </Badge>
    )
  }
}
