import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from '@dhis2/app-runtime';
import { Config } from '@dhis2/app-service-config/build/types/types';
import { init } from 'd2';
import { extendObservable } from 'mobx';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Loading from './components/Loading';
import { StoreContext } from './Context';
import { store } from './Store';
import './index.css';

let baseUrl = process.env.REACT_APP_DHIS2_URL || 'http://localhost:8080/';

if (process.env.NODE_ENV === 'production') {
  baseUrl = '../../../'
}
const config = {
  baseUrl: baseUrl + 'api',
  headers: process.env.NODE_ENV === 'development' ? { Authorization: process.env.REACT_APP_DHIS2_PASS } : null
};

ReactDOM.render(<Loading className="full-height" />, document.getElementById('root'));

const initialize = async () => {
  try {
    const d2 = await init(config);
    const appConfig: Config = {
      baseUrl,
      apiVersion: 32,
    }
    extendObservable(store, { d2 })

    ReactDOM.render(<Provider config={appConfig} >
      <StoreContext.Provider value={store}>
        <App />
      </StoreContext.Provider>
    </Provider>, document.getElementById('root'));
  } catch (error) {
    ReactDOM.render(<div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      fontSize: 28
    }}>
      {JSON.stringify(error)}
    </div>, document.getElementById('root'))
  }
}

initialize();
serviceWorker.unregister();
