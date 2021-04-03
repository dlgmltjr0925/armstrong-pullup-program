import { CountInputState, resetCountInputAction } from '../reducers/countInput';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';

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
  const countInput = useSelector(
    ({ countInput }: { countInput: CountInputState }) => countInput
  );
  const dispatch = useDispatch();

  const [count, setCount] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());

  const { onChange, onClickConfirm, timeOut, max = 999 } = countInput;

  const timer = useMemo(() => {
    if (!timeOut) return null;
    return Math.max(Math.floor((timeOut.valueOf() - now.valueOf()) / 1000), 0);
  }, [timeOut, now]);

  const handleClickIncrease = (isIncrease: boolean) => {
    return () => {
      let newCount = isIncrease ? count + 1 : count - 1;
      newCount = newCount > max ? max : newCount < 0 ? 0 : newCount;
      setCount(newCount);
    };
  };

  const handleClickPad = (number: string) => {
    return () => {
      if (number === 'backspace') {
        setCount(Math.floor(count / 10));
      } else if (/\d/.test(number)) {
        const newCount = parseInt(count + number, 10);
        setCount(newCount > max ? max : newCount);
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
    if (timer === 0) handleClickOk();
  }, [timer]);

  useEffect(() => {
    if (onChange) onChange(count);
  }, [count]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (countInput.count !== -1) {
      if (countInput.timeOut) {
        setNow(new Date());
        interval = setInterval(() => {
          setNow(new Date());
        }, 1000);
      }
      setCount(countInput.count);
      setVisible(true);
    } else {
      setVisible(false);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
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
          <button onClick={handleClickOk}>
            OK
            {!!timer && <span className='timer'>{timer}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountInput;
