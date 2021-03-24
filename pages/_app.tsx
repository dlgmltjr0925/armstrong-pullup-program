import {
  Middleware,
  Store,
  applyMiddleware,
  compose,
  createStore,
} from 'redux';

import { composeWithDevTools } from 'redux-devtools-extension';
import { createWrapper } from 'next-redux-wrapper';
import reducer from '../reducers';

interface AppProps {
  Component: any;
  store: Store;
}

const App = ({ Component }: AppProps) => {
  return <Component />;
};

const makeStore = (initialState: any) => {
  const middlewares: Middleware<any, any, any>[] = [];
  const enhancer =
    process.env.NODE_ENV === 'production'
      ? compose(applyMiddleware(...middlewares))
      : composeWithDevTools(applyMiddleware(...middlewares));
  const store = createStore(reducer, initialState, enhancer);
  return store;
};

const wrapper = createWrapper(makeStore);

export default wrapper.withRedux(App);
