import { useEffect, useMemo, useState } from 'react';

import dateFormat from 'dateformat';

const week = ['일', '월', '화', '수', '목', '금', '토'];

const Clock = () => {
  const [now, setNow] = useState<Date>(new Date());

  const dayOfWeek = useMemo(() => week[now.getDay()], [now]);

  const strTime = useMemo(() => {
    return dateFormat(now, `yyyy. mm. dd(${dayOfWeek}) hh:MM:ss`);
  }, [now]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = setInterval(() => {
      setNow(new Date());
    }, 500);
    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, []);

  return <span>{strTime}</span>;
};

export default Clock;
