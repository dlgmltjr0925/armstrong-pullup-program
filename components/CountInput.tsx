import { CountInputState, resetCountInputAction } from '../reducers/countInput';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackspace } from '@fortawesome/free-solid-svg-icons';

const keyPads = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '',
  '0',
  'backspace',
];

const CountInput = () => {
  const dispatch = useDispatch();

  const [count, setCount] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(true);
  const countInput = useSelector(
    ({ countInput }: { countInput: CountInputState }) => countInput
  );

  const { onChange, onClickConfirm } = countInput;

  const handleClickIncrease = (isIncrease: boolean) => {
    return () => {
      let newCount = isIncrease ? count + 1 : count - 1;
      newCount = newCount > 999 ? 999 : newCount < 0 ? 0 : newCount;
      setCount(newCount);
    };
  };

  const handleClickPad = (number: string) => {
    return () => {
      if (number === 'backspace') {
        setCount(Math.floor(count / 10));
      } else if (/\d/.test(number)) {
        const newCount = parseInt(count + number, 10);
        setCount(newCount > 999 ? 999 : newCount);
      }
    };
  };

  const handleClickCancel = () => {
    dispatch(resetCountInputAction());
  };

  const handleClickOk = () => {
    if (onClickConfirm) onClickConfirm(count);
    dispatch(resetCountInputAction());
  };

  useEffect(() => {
    if (onChange) onChange(count);
  }, [count]);

  useEffect(() => {
    if (countInput.count !== -1) {
      setCount(countInput.count);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [countInput]);

  return (
    <div className={`count-input-container${visible ? '' : ' invisible'}`}>
      <div className='count-container'>
        <div className='count-wrapper'>
          <span className={`count${count > 100 ? ' max-length' : ''}`}>
            {count}
          </span>
        </div>
        <div className='btn-wrapper'>
          <button className='btn' onClick={handleClickIncrease(true)}>
            +
          </button>
          <button className='btn' onClick={handleClickIncrease(false)}>
            -
          </button>
        </div>
      </div>

      <div className='keyboard-wrapper'>
        <div className='row'>
          {keyPads.slice(0, 3).map((number) => (
            <button
              key={number}
              className='key-pad'
              onClick={handleClickPad(number)}
            >
              {number}
            </button>
          ))}
        </div>
        <div className='row'>
          {keyPads.slice(3, 6).map((number) => (
            <button
              key={number}
              className='key-pad'
              onClick={handleClickPad(number)}
            >
              {number}
            </button>
          ))}
        </div>
        <div className='row'>
          {keyPads.slice(6, 9).map((number) => (
            <button
              key={number}
              className='key-pad'
              onClick={handleClickPad(number)}
            >
              {number}
            </button>
          ))}
        </div>
        <div className='row'>
          {keyPads.slice(9, 12).map((number) => (
            <button
              key={number}
              className={`key-pad${number === '' ? ' empty' : ''}`}
              onClick={handleClickPad(number)}
            >
              {number !== 'backspace' ? (
                number
              ) : (
                <FontAwesomeIcon className='back-icon' icon={faBackspace} />
              )}
            </button>
          ))}
        </div>
        <div className='bottom-wrapper'>
          <button onClick={handleClickCancel}>Cancel</button>
          <button onClick={handleClickOk}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default CountInput;
