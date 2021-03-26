import { useEffect, useMemo, useState } from 'react';

interface TimerProps {
  time: number;
  onEnd: () => void;
}

const Timer = ({ time, onEnd }: TimerProps) => {
  const [base] = useState<Date>(new Date());
  const [current, setCurrent] = useState<Date>(new Date());

  const second = useMemo(() => {
    const diff = Math.floor((current.valueOf() - base.valueOf()) / 1000);
    const second = time - diff;
    return Math.max(0, second);
  }, [current]);

  useEffect(() => {
    if (second === 0) onEnd();
  }, [second]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(new Date());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return <span>{second}</span>;
};

export default Timer;
