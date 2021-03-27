import { Member, Record } from '../interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PushUp from './PushUp';
import Timer from './Timer';
import axios from 'axios';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';

type Status = 'READY' | 'EXERCISING' | 'REST' | 'COMPLETE';
interface MondayProps {
  date: Date;
}

const REST_TIME = 2; // 90s

const Monday = ({ date }: MondayProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const [status, setStatus] = useState<Status>('READY');
  const [counts, setCounts] = useState(
    Array.from({ length: 5 }, () => ({
      prev: 0,
      current: 0,
      isDone: false,
      isSaved: false,
    }))
  );

  const currentSet = useMemo(() => counts.findIndex(({ isDone }) => !isDone), [
    counts,
  ]);

  const getYesterdayRecords = useCallback(async () => {
    try {
      const lastWeekDate = new Date(date);
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeek = dateFormat(lastWeekDate, 'yyyymmdd');
      const res = await axios.get(`/api/record/${member.id}/${lastWeek}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        console.log('getYesterdayRecords', records);
      }
    } catch (error) {
      throw error;
    }
  }, [member, date]);

  const getRecords = useCallback(async () => {
    const newCounts = [...counts];
    try {
      const lastWeekDate = new Date(date);
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeek = dateFormat(lastWeekDate, 'yyyymmdd');
      let res = await axios.get(`/api/record/${member.id}/${lastWeek}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        records.forEach(({ set, count }: Record) => {
          const index = set - 1;
          newCounts[index].prev = count;
          newCounts[index].current = count;
        });
      }

      const today = dateFormat(date, 'yyyymmdd');
      res = await axios.get(`/api/record/${member.id}/${today}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        records.forEach(({ set, count }: Record) => {
          const index = set - 1;
          newCounts[index].current = count;
          newCounts[index].isDone = true;
          newCounts[index].isSaved = true;
        });
        if (records.length === 5) setStatus('COMPLETE');
        else if (records.length > 0) setStatus('EXERCISING');
      }

      setCounts(newCounts);
    } catch (error) {
      throw error;
    }
  }, [member, date, counts, getYesterdayRecords]);

  const enrollRecord = useCallback(async (record: Omit<Record, 'id'>) => {
    try {
      const res = await axios.post(`/api/record/${member.id}`, {
        record,
      });
      return res && res.status === 200;
    } catch (error) {
      throw error;
    }
  }, []);

  const handleClickReady = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const handlePressRest = useCallback(() => {
    setStatus('REST');
  }, []);

  const handleEndTimer = useCallback(async () => {
    const newCounts = [...counts];
    newCounts[currentSet].isDone = true;
    const index = newCounts.findIndex(({ isDone }) => !isDone);
    setCounts(newCounts);
    if (index === -1) {
      setStatus('COMPLETE');
    } else {
      setStatus('EXERCISING');
    }
  }, [currentSet, counts]);

  const handleChangeCount = useCallback(
    async (e) => {
      const count = parseInt(e.target.value, 10);
      const newCounts = [...counts];
      newCounts[currentSet].current = isNaN(count) ? 0 : count;
      setCounts(newCounts);
    },
    [currentSet, counts]
  );

  useEffect(() => {
    if (currentSet === 0) return;
    const index = currentSet === -1 ? 4 : currentSet - 1;
    const prevSetCount = counts[index];
    if (prevSetCount.isDone && !prevSetCount.isSaved) {
      console.log({
        date: dateFormat(date, 'yyyymmdd'),
        type: 'MAX_COUNT',
        count: prevSetCount.current,
        set: index + 1,
      });
      try {
        enrollRecord({
          date: dateFormat(date, 'yyyymmdd'),
          type: 'MAX_COUNT',
          count: prevSetCount.current,
          set: index + 1,
        });
      } catch (error) {
        console.error(error);
      }
    }
  }, [currentSet]);

  useEffect(() => {
    getRecords();
  }, []);

  return (
    <div>
      <PushUp date={date} />
      <p>Max 5 Set </p>
      {counts.map(({ current, isDone, isSaved }, index) => {
        return !isDone ? null : (
          <div key={index}>
            <span>{current}</span>
            {isSaved && <span>saved</span>}
          </div>
        );
      })}
      {status === 'READY' && <button onClick={handleClickReady}>시작</button>}
      {status === 'EXERCISING' && (
        <>
          <p>운동 중</p>
          <button onClick={handlePressRest}>휴식</button>
        </>
      )}
      {status === 'REST' && (
        <div>
          휴식 <Timer time={REST_TIME} onEnd={handleEndTimer} /> 초
          <p>
            개수
            <input
              type='text'
              pattern='\d*'
              value={counts[currentSet].current}
              onChange={handleChangeCount}
            />
          </p>
        </div>
      )}
    </div>
  );
};

export default Monday;
