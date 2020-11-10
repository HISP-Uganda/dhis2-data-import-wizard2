import React from 'react'
import { store } from './Store';
// eslint-disable-next-line import/no-webpack-loader-syntax
import createWorker from 'workerize-loader?inline!./workers/worker';
import * as Worker from './workers/worker';

export const StoreContext = React.createContext(store)

export const StoreProvider: React.FC<any> = ({ children }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const store = React.useContext(StoreContext)
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider.')
  }
  return store
}

const worker = createWorker<typeof Worker>();

export const useWorker = () => worker;
