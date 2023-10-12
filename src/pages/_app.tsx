import '../styles/styles.css';

import {
  Middleware,
  Store,
  applyMiddleware,
  compose,
  createStore,
} from 'redux';

import { composeWithDevTools } from '@redux-devtools/extension';
import createSagaMiddleware from 'redux-saga';
import { createWrapper } from 'next-redux-wrapper';
import reducer from '../reducers';
import axios from 'axios';

interface AppProps {
  Component: any;
  store: Store;
}

const App = ({ Component }: AppProps) => {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_PATH;
  return <Component />;
};

const sagaMiddleware = createSagaMiddleware();

const makeStore = (initialState: any) => {
  const middlewares: Middleware<any, any, any>[] = [sagaMiddleware];
  const enhancer =
    process.env.NODE_ENV === 'production'
      ? compose(applyMiddleware(...middlewares))
      : composeWithDevTools(applyMiddleware(...middlewares));
  const store = createStore(reducer, initialState, enhancer);

  return store;
};

const wrapper = createWrapper(makeStore);

export default wrapper.withRedux(App);
