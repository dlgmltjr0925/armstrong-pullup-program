import { useEffect, useMemo, useState } from 'react';

interface TimerProps {
  timeOut: Date;
  onEnd: () => void;
}

const Timer = ({ timeOut, onEnd }: TimerProps) => {
  const [current, setCurrent] = useState<Date>(new Date());

  const second = useMemo(() => {
    return Math.max(
      Math.floor((timeOut.valueOf() - current.valueOf()) / 1000),
      0
    );
  }, [timeOut, current]);

  useEffect(() => {
    if (second === 0) onEnd();
  }, [second]);

  useEffect(() => {
    setCurrent(new Date());
    const interval = setInterval(() => {
      setCurrent(new Date());
    }, 100);

    return () => clearInterval(interval);
  }, [timeOut]);

  return <span>{second}</span>;
};

export default Timer;
