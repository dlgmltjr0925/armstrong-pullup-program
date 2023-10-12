import { combineReducers } from 'redux';
import countInput from './countInput';
import member from './member';

const rootReducer = combineReducers({
  member,
  countInput,
});

export default rootReducer;
