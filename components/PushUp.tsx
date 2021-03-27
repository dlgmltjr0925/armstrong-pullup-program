import { useCallback, useEffect, useState } from 'react';

interface PushUpProps {
  date: Date;
}

const PushUp = ({ date }: PushUpProps) => {
  const [counts, setCounts] = useState<number[]>([-1, -1, -1]);

  const getRecord = useCallback(async () => {}, []);

  useEffect(() => {
    getRecord();
  }, []);

  return (
    <div>
      {counts.map((count, index) => {
        if (count !== -1) return <span key={index}>{count}</span>;
        else return <button key={index}>{`set${index + 1}`}</button>;
      })}
    </div>
  );
};

export default PushUp;
