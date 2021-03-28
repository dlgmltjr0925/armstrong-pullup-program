import { Member, Record, Status } from '../interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PushUp from './PushUp';
import Timer from './Timer';
import axios from 'axios';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';

interface ThursdayRecord {
  id?: number;
  count: number;
  isDone: boolean;
  isSaved: boolean;
}

interface ThursdayProps {
  date: Date;
}

const REST_TIME = 60; // 60s

const Thursday = ({ date }: ThursdayProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const [status, setStatus] = useState<Status>('READY');
  const [records, setRecords] = useState<ThursdayRecord[]>([]);
  const [goal, setGoal] = useState<number>(3);

  const currentOrder = useMemo(() => records.length, [records]);

  const handleClickReady = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const handleClickSuccess = useCallback(() => {
    setRecords([
      ...records,
      {
        count: goal,
        isDone: true,
        isSaved: false,
      },
    ]);
    setStatus('REST');
  }, [records, goal]);

  const handleClickFail = useCallback(() => {
    setRecords([
      ...records,
      {
        count: goal,
        isDone: false,
        isSaved: false,
      },
    ]);
    setStatus('COMPLETE');
  }, [records, goal]);

  const handleEndTimer = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const handleChangeCount = useCallback(
    async (e) => {
      const count = parseInt(e.target.value, 10);
      const newCounts = [...records];
      newCounts[currentOrder - 1].count = isNaN(count)
        ? 0
        : count > goal
        ? goal - 1
        : count;
      newCounts[currentOrder - 1].isSaved = false;
      setRecords(newCounts);
    },
    [currentOrder, records, goal]
  );

  const handleClickSave = useCallback(() => {
    const newCounts = [...records];
    newCounts[currentOrder - 1].isDone = true;
    setRecords(newCounts);
  }, [currentOrder, records]);

  const getRecords = useCallback(async () => {
    try {
      let goal = 1;
      const firstDate = new Date(date);
      firstDate.setDate(firstDate.getDate() - 1);
      const lastWeek = dateFormat(firstDate, 'yyyymmdd');
      let res = await axios.get(`/api/record/${member.id}/${lastWeek}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        let max = 0;
        records.forEach(({ count }: Record) => {
          if (count > max) max = count;
        });
        goal = Math.floor(max / 2);
        setGoal(goal);
      }

      const today = dateFormat(date, 'yyyymmdd');
      res = await axios.get(`/api/record/${member.id}/${today}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        if (records.length === 0) return;
        const newRecords = records.map(({ id, count }: Record) => ({
          id,
          count,
          isDone: true,
          isSaved: true,
        })) as ThursdayRecord[];
        if (newRecords[newRecords.length - 1].count !== goal)
          setStatus('COMPLETE');
        else if (records.length > 0) setStatus('EXERCISING');
        else setStatus('READY');
        setRecords(newRecords);
      }
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
            type: 'MAX_SET',
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
      <p>MAX Set</p>
      <p>{`${records.length} set`}</p>
      {records.map((record, index) => {
        return (
          <span key={index}>{`${record.count} [${
            record.isSaved ? 'saved' : ''
          }] `}</span>
        );
      })}
      {status === 'READY' && <button onClick={handleClickReady}>시작</button>}
      {status === 'EXERCISING' && (
        <>
          <p>운동 중</p>
          <>
            <button onClick={handleClickSuccess}>성공</button>
            <button onClick={handleClickFail}>실패</button>
          </>
        </>
      )}
      {status === 'REST' && (
        <div>
          휴식 <Timer time={REST_TIME} onEnd={handleEndTimer} /> 초
        </div>
      )}
      {status === 'COMPLETE' && records.find(({ isDone }) => !isDone) && (
        <p>
          개수
          <input
            type='text'
            pattern='\d*'
            value={records[currentOrder - 1].count}
            onChange={handleChangeCount}
          />
          <button onClick={handleClickSave}>저장</button>
        </p>
      )}
    </div>
  );
};

export default Thursday;
