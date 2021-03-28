import { Member, Record, Status } from '../interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PushUp from './PushUp';
import Timer from './Timer';
import axios from 'axios';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';

interface TuesdayProps {
  date: Date;
}

interface TuesdayRecord {
  id?: number;
  count: number;
  isSuccessed: boolean;
  isDone: boolean;
  isSaved: boolean;
}

const Tuesday = ({ date }: TuesdayProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const [status, setStatus] = useState<Status>('READY');
  const [records, setRecords] = useState<TuesdayRecord[]>([]);
  const [lastWeekMax, setLastWeekMax] = useState<number>(0);

  const currentOrder = useMemo(() => records.length, [records]);

  const [isFailed, restTime] = useMemo(() => {
    const index = records.findIndex(({ isSuccessed }) => !isSuccessed);
    const isFailed = index !== -1;
    const restTime = index === -1 ? records.length : index;
    return [isFailed, restTime * 10];
  }, [records]);

  const handleClickReady = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const handleClickSuccess = useCallback(() => {
    setRecords([
      ...records,
      {
        count: records.length + 1,
        isSuccessed: true,
        isDone: true,
        isSaved: false,
      },
    ]);
    setStatus('REST');
  }, [records]);

  const handleClickFail = useCallback(() => {
    setRecords([
      ...records,
      {
        count: records.length,
        isSuccessed: false,
        isDone: true,
        isSaved: false,
      },
    ]);
    setStatus('REST');
  }, [records]);

  const handleClickFinish = useCallback(() => {
    setStatus('COMPLETE');
  }, []);

  const handleEndTimer = useCallback(() => {
    if (isFailed) {
      const { length } = records;
      setRecords([
        ...records,
        {
          ...records[length - 1],
          isSuccessed: false,
          isSaved: false,
        },
      ]);
    }
    setStatus('EXERCISING');
  }, [isFailed]);

  const handleChangeCount = useCallback(
    async (e) => {
      const count = parseInt(e.target.value, 10);
      const newCounts = [...records];
      newCounts[currentOrder - 1].count = isNaN(count) ? 0 : count;
      newCounts[currentOrder - 1].isSaved = false;
      setRecords(newCounts);
    },
    [currentOrder, records]
  );

  const getRecords = useCallback(async () => {
    try {
      const lastWeekDate = new Date(date);
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeek = dateFormat(lastWeekDate, 'yyyymmdd');
      let res = await axios.get(`/api/record/${member.id}/${lastWeek}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        const max = records.length - 2;
        if (max > lastWeekMax) setLastWeekMax(max);
      }

      const today = dateFormat(date, 'yyyymmdd');
      res = await axios.get(`/api/record/${member.id}/${today}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        if (records.length === 0) return;
        const newRecords = records.map(({ id, count, order }: Record) => ({
          id,
          count,
          isSuccessed: count === order,
          isDone: true,
          isSaved: true,
        })) as TuesdayRecord[];
        const failCount = newRecords.filter(({ isSuccessed }) => !isSuccessed)
          .length;
        if (failCount === 2) setStatus('COMPLETE');
        else if (records.length > 0) setStatus('EXERCISING');
        else setStatus('READY');
        setRecords(newRecords);
      }
    } catch (error) {
      throw error;
    }
  }, [member, date, records, lastWeekMax]);

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
            type: 'MAX_COUNT',
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
      <p>Pyramid</p>
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
          {!isFailed ? (
            <>
              <button onClick={handleClickSuccess}>성공</button>
              <button onClick={handleClickFail}>실패</button>
            </>
          ) : (
            <>
              <input
                type='text'
                pattern='\d*'
                value={records[currentOrder - 1].count}
                onChange={handleChangeCount}
              />
              <button onClick={handleClickFinish}>종료</button>
            </>
          )}
        </>
      )}
      {status === 'REST' && (
        <div>
          휴식 <Timer time={restTime} onEnd={handleEndTimer} /> 초
          {isFailed && (
            <p>
              개수
              <input
                type='text'
                pattern='\d*'
                value={records[currentOrder - 1].count}
                onChange={handleChangeCount}
              />
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Tuesday;
