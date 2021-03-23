import { Middleware, applyMiddleware, compose, createStore } from 'redux';

import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from '../reducers';
import withRedux from 'next-redux-wrapper';

const App = ({ Component, store }) => {
  return (
    <Provider store={store}>
      <Component />
    </Provider>
  );
};

const configureStore = (initialState) => {
  const middlewares: Middleware<any, any, any>[] = [];
  const enhancer =
    process.env.NODE_ENV === 'production'
      ? compose(applyMiddleware(...middlewares))
      : composeWithDevTools(applyMiddleware(...middlewares));
  const store = createStore(reducer, initialState, enhancer);
  return store;
};

export default withRedux(configureStore)(App);
