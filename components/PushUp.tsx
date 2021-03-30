import { useCallback, useEffect, useState } from 'react';

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
    <div>
      {records.map(({ prev, count }, index) => {
        if (count !== -1) return <span key={index}>{count}</span>;
        else return <button key={index}>{`set${index + 1}`}</button>;
      })}
    </div>
  );
};

export default PushUp;
