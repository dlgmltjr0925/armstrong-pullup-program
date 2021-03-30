import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackspace } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

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
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className={`count-input-container${visible ? '' : ' invisible'}`}>
      <div className='count-wrapper'>
        <span className='count'>{count}</span>
      </div>
      <div className='keyboard-wrapper'>
        <div className='row'>
          {keyPads.slice(0, 3).map((number) => (
            <button key={number} className='key-pad'>
              {number}
            </button>
          ))}
        </div>
        <div className='row'>
          {keyPads.slice(3, 6).map((number) => (
            <button key={number} className='key-pad'>
              {number}
            </button>
          ))}
        </div>
        <div className='row'>
          {keyPads.slice(6, 9).map((number) => (
            <button key={number} className='key-pad'>
              {number}
            </button>
          ))}
        </div>
        <div className='row'>
          {keyPads.slice(9, 12).map((number) => (
            <button
              key={number}
              className={`key-pad${number === '' ? ' empty' : ''}`}
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
