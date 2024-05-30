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
import { Provider } from 'react-redux';

interface AppProps {
  Component: any;
  store: Store;
}

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

const App = ({ Component, ...rest }: AppProps) => {
  const { store, props } = wrapper.useWrappedStore(rest);
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_PATH;

  return (
    <Provider store={store}>
      <Component {...props.pageProps} />
    </Provider>
  );
};

export default App;
