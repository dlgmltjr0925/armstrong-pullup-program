import { useCallback, useEffect, useState } from 'react';

import PushUpItem from './PushUpItem';

interface PushUpProps {
  date: Date;
}

interface Record {
  prev: number;
  count: number;
}

const PushUp = ({ date }: PushUpProps) => {
  const [records, setRecords] = useState<Record[]>(
    Array.from({ length: 3 }, () => ({
      prev: 0,
      count: 0,
    }))
  );

  const getRecord = useCallback(async () => {}, []);

  useEffect(() => {
    getRecord();
  }, []);

  return (
    <div className='push-up-container'>
      <p className='category'>Push Up</p>
      <div className='push-up-wrapper'>
        {records.map((record, index) => {
          const isActive = index === 0 || records[index - 1].count !== 0;
          return <PushUpItem key={index} record={record} isActive={isActive} />;
        })}
      </div>
    </div>
  );
};

export default PushUp;
