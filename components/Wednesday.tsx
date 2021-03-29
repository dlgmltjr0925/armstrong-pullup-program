import { Member, Record, Status } from '../interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PushUp from './PushUp';
import Timer from './Timer';
import axios from 'axios';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';

interface WednesdayRecord {
  id?: number;
  count: number;
  isDone: boolean;
  isSaved: boolean;
}

interface WednesdayProps {
  date: Date;
}

const REST_TIME = 60; // 60s

const getInitialRecords = () =>
  Array.from({ length: 9 }, () => ({
    count: 1,
    isDone: false,
    isSaved: false,
  }));

const Wednesday = ({ date }: WednesdayProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const [status, setStatus] = useState<Status>('READY');
  const [goal, setGoal] = useState<number>(1);
  const [records, setRecords] = useState<WednesdayRecord[]>(
    getInitialRecords()
  );

  const currentOrder = useMemo(
    () => records.findIndex(({ isDone }) => !isDone),
    [records]
  );

  const handleClickReady = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const handleClickRest = useCallback(() => {
    setStatus('REST');
  }, []);

  const handleEndTimer = useCallback(async () => {
    const newRecords = [...records];
    newRecords[currentOrder].count = goal;
    newRecords[currentOrder].isDone = true;
    setRecords(newRecords);
    const index = newRecords.findIndex(({ isDone }) => !isDone);
    if (index === -1) {
      setStatus('COMPLETE');
    } else {
      setStatus('EXERCISING');
    }
  }, [currentOrder, records, goal]);

  const getRecords = useCallback(async () => {
    const newRecords = getInitialRecords();
    try {
      let goal = 1;
      const lastWeekDate = new Date(date);
      lastWeekDate.setDate(lastWeekDate.getDate() - 6);
      const lastWeek = dateFormat(lastWeekDate, 'yyyymmdd');
      let res = await axios.get(`/api/record/${member.id}/${lastWeek}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        if (records.length < 2) {
          const firstDate = new Date(date);
          firstDate.setDate(firstDate.getDate() - 2);
          const first = dateFormat(firstDate, 'yyyymmdd');
          res = await axios.get(`/api/record/${member.id}/${first}`);

          if (res && res.status === 200) {
            const { records } = res.data;
            let max = 0;
            records.forEach(({ count }: Record) => {
              if (count > max) max = count;
            });
            goal = Math.floor(max / 2);
            setGoal(goal);
          }
        } else if (records.length <= 9) {
          setGoal(records[0].count);
        } else {
          setGoal(records[0].count + 1);
        }
      }

      const today = dateFormat(date, 'yyyymmdd');
      res = await axios.get(`/api/record/${member.id}/${today}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        records.forEach(({ order }: Record) => {
          const index = order - 1;
          newRecords[index].count = goal;
          newRecords[index].isDone = true;
          newRecords[index].isSaved = true;
        });
        if (records.length === 9) setStatus('COMPLETE');
        else if (records.length > 0) setStatus('EXERCISING');
        else setStatus('READY');
      }

      setRecords(newRecords);
    } catch (error) {
      throw error;
    }
  }, [member, date, records]);

  const updateRecord = useCallback(
    async (record: Record): Promise<Record | void> => {
      try {
        const res = await axios.put(`/api/record/${member.id}`, { record });
        if (res && res.status === 200) {
          return res.data.record;
        }
      } catch (error) {
        throw error;
      }
    },
    [member]
  );

  const enrollRecord = useCallback(
    async (record: Omit<Record, 'id'>): Promise<Record | void> => {
      try {
        const res = await axios.post(`/api/record/${member.id}`, { record });
        if (res && res.status === 200) {
          return res.data.record;
        } else if (res && res.status === 202) {
          const { id } = res.data;
          return (await updateRecord({ id, ...record })) as Record;
        }
      } catch (error) {
        throw error;
      }
    },
    [member]
  );

  const sync = useCallback(async () => {
    try {
      const index = records.findIndex(
        ({ isDone, isSaved }) => isDone && !isSaved
      );
      if (index === -1) return;
      Promise.all(
        records.map(async ({ id, count, isDone, isSaved }, index) => {
          if (!isDone || isSaved) return null;
          const newRecord: Omit<Record, 'id'> = {
            date: dateFormat(date, 'yyyymmdd'),
            type: 'THREE_GRIP',
            count,
            order: index + 1,
          };
          if (id) {
            return await updateRecord({ id, ...newRecord });
          } else {
            return await enrollRecord(newRecord);
          }
        })
      ).then((results) => {
        let willBeUpdate = false;
        const newRecords = [...records];
        results.forEach((result, index) => {
          if (result === null) return;
          if (!willBeUpdate) willBeUpdate = true;
          newRecords[index].isSaved = true;
        });
        if (willBeUpdate) setRecords(newRecords);
      });
    } catch (error) {
      throw error;
    }
  }, [records, updateRecord, enrollRecord]);

  useEffect(() => {
    sync();
  }, [records]);

  useEffect(() => {
    getRecords();
  }, [date]);

  return (
    <div>
      <PushUp date={date} />
      <p>{`count : ${goal}`}</p>
      <p>pull up 3 sets</p>
      {records.slice(0, 3).map(({ count, isDone, isSaved }, index) => {
        return !isDone ? null : (
          <span key={index}>
            <span>{count}</span>
            {isSaved && <span> [saved]</span>}
          </span>
        );
      })}
      {(currentOrder === -1 || currentOrder >= 3) && (
        <>
          <p>chin up 3 sets</p>
          {records.slice(3, 6).map(({ count, isDone, isSaved }, index) => {
            return !isDone ? null : (
              <span key={index}>
                <span>{count}</span>
                {isSaved && <span> [saved]</span>}
              </span>
            );
          })}
        </>
      )}
      {(currentOrder === -1 || currentOrder >= 6) && (
        <>
          <p>wide pull up 3 sets</p>
          {records.slice(6, 9).map(({ count, isDone, isSaved }, index) => {
            return !isDone ? null : (
              <span key={index}>
                <span>{count}</span>
                {isSaved && <span> [saved]</span>}
              </span>
            );
          })}
        </>
      )}
      {status === 'READY' && <button onClick={handleClickReady}>시작</button>}
      {status === 'EXERCISING' && (
        <>
          <p>운동 중</p>
          <button onClick={handleClickRest}>휴식</button>
        </>
      )}
      {status === 'REST' && (
        <div>
          휴식 <Timer time={REST_TIME} onEnd={handleEndTimer} /> 초
        </div>
      )}
    </div>
  );
};

export default Wednesday;
