export interface CountInputState {
  count: number;
  onChange?: (count: number) => void;
  onClickConfirm?: (count: number) => void;
}

export enum CountInputType {
  SET = 'SET',
  RESET = 'RESET',
}

export interface CountInputAction {
  type: CountInputType;
  payload: CountInputState;
}

const initialState: CountInputState = {
  count: -1,
};

export const setCountInputAction = (
  payload: CountInputState
): CountInputAction => ({
  type: CountInputType.SET,
  payload,
});

export const resetCountInputAction = (): CountInputAction => ({
  type: CountInputType.SET,
  payload: { count: -1 },
});

const reducer = (
  state: CountInputState = initialState,
  action: CountInputAction
) => {
  switch (action.type) {
    case CountInputType.SET:
      return action.payload;
    case CountInputType.RESET:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
