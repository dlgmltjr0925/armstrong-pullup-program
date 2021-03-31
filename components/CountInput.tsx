import { useCallback, useEffect, useState } from 'react';

import { CountInputState } from '../reducers/countInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackspace } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

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
  const [count, setCount] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(true);
  const countInput = useSelector(
    ({ countInput }: { countInput: CountInputState }) => countInput
  );

  useEffect(() => {
    if (countInput.count !== -1) {
      setCount(countInput.count);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [countInput]);

  const handleClickIncrease = (isIncrease: boolean) => {
    return () => {
      let newCount = isIncrease ? count + 1 : count - 1;
      newCount = newCount > 9999 ? 9999 : newCount < 0 ? 0 : newCount;
      setCount(newCount);
    };
  };

  const handleClickPad = (number: string) => {
    return () => {
      if (number === 'backspace') {
        setCount(Math.floor(count / 10));
      } else if (/\d/.test(number)) {
        const newCount = parseInt(count + number, 10);
        setCount(newCount > 9999 ? 9999 : newCount);
      }
    };
  };

  return (
    <div className={`count-input-container${visible ? '' : ' invisible'}`}>
      <div className='count-container'>
        <button className='btn' onClick={handleClickIncrease(false)}>
          -
        </button>
        <div className='count-wrapper'>
          <span className='count'>{count}</span>
        </div>
        <button className='btn' onClick={handleClickIncrease(true)}>
          +
        </button>
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
      </div>
    </div>
  );
};

export default CountInput;
