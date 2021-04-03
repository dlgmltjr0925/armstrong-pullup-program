import {
  faBed,
  faKissWinkHeart,
  faMusic,
  faTv,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';

interface HolidayProps {
  date: Date;
}

const ICON_LIST = [faKissWinkHeart, faBed, faMusic, faTv];

const Holiday = ({ date }: HolidayProps) => {
  const icon = useMemo(() => {
    const index = Math.floor(Math.random() * 10) % ICON_LIST.length;
    return ICON_LIST[index];
  }, [date]);

  return (
    <div className='holiday-container'>
      <FontAwesomeIcon className='icon' icon={icon} />
      <p>충분한 휴식의 취하세요</p>
    </div>
  );
};

export default Holiday;
