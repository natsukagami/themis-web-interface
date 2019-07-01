import React from 'react'
import reactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import { AskNotification } from './notifications'
import LeftMenu from './components/LeftMenu'

// Initialize fontAwesome
import './fontawesome'
import ContestClock from './components/ContestClock'
import Main from './components/Main'

reactDOM.render(
  <Provider store={store}>
    <div>
      <AskNotification />

      <ContestClock />

      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-3'>
            <LeftMenu />
          </div>
          <div className='col-md-9'>
            <Main />
          </div>
        </div>
      </div>
    </div>
  </Provider>,
  document.getElementById('root')
)
