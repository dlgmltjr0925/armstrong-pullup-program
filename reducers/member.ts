import { Member } from '../interfaces';

export interface MemberState extends Member {}

export enum MemberActionType {
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
}

interface MemberAction {
  type: MemberActionType;
  payload: MemberState;
}

export const initialState: MemberState = {
  id: 0,
  nickname: '',
};

export const signInAction = (payload: MemberState) => ({
  type: MemberActionType.SIGN_IN,
  payload,
});

export const signOutAction = () => ({
  type: MemberActionType.SIGN_OUT,
});

const reducer = (state: MemberState = initialState, action: MemberAction) => {
  // 리듀서
  switch (action.type) {
    case MemberActionType.SIGN_IN:
      return action.payload;
    case MemberActionType.SIGN_OUT:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
