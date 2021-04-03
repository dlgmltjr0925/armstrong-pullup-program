import { Member, Record, Status } from '../interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PushUp from './PushUp';
import RecordItem from './RecordItem';
import Timer from './Timer';
import axios from 'axios';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';

interface MondayRecord {
  id?: number;
  prev: number;
  count: number;
  isDone: boolean;
  isSaved: boolean;
}

interface MondayProps {
  date: Date;
}

const REST_TIME = 90; // 90s

const getInitialRecords = (): MondayRecord[] =>
  Array.from({ length: 5 }, () => ({
    prev: 0,
    count: 0,
    isDone: false,
    isSaved: false,
  }));

const Monday = ({ date }: MondayProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const [status, setStatus] = useState<Status>('READY');
  const [records, setRecords] = useState<MondayRecord[]>(getInitialRecords());

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
    newRecords[currentOrder].isDone = true;
    if (newRecords[currentOrder + 1]?.count === 0) {
      newRecords[currentOrder + 1].count = newRecords[currentOrder].count;
    }
    setRecords(newRecords);
    const index = newRecords.findIndex(({ isDone }) => !isDone);
    if (index === -1) {
      setStatus('COMPLETE');
    } else {
      setStatus('EXERCISING');
    }
  }, [currentOrder, records]);

  const handleChangeCount = useCallback(
    async (e) => {
      const count = parseInt(e.target.value, 10);
      const newRecords = [...records];
      newRecords[currentOrder].count = isNaN(count) ? 0 : count;
      setRecords(newRecords);
    },
    [currentOrder, records]
  );

  const getRecords = useCallback(async () => {
    const newRecords = getInitialRecords();
    try {
      const lastWeekDate = new Date(date);
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeek = dateFormat(lastWeekDate, 'yyyymmdd');
      let res = await axios.get(`/api/record/${member.id}/${lastWeek}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        records.forEach(({ order, count }: Record) => {
          const index = order - 1;
          newRecords[index].prev = count;
          newRecords[index].count = count;
        });
      }

      const today = dateFormat(date, 'yyyymmdd');
      res = await axios.get(`/api/record/${member.id}/${today}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        records.forEach(({ order, count }: Record) => {
          const index = order - 1;
          newRecords[index].count = count;
          newRecords[index].isDone = true;
          newRecords[index].isSaved = true;
        });
        if (records.length === 5) setStatus('COMPLETE');
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
    <div className='monday-container'>
      <PushUp date={date} />
      <div id='record' className='record-container'>
        <h1 className='category'>풀업 5세트</h1>
        <p className='describe'>최대 반복 횟수, 쉬는 시간 : 90초</p>
        <div className='record-wrapper monday-wrapper'>
          {records.map((record, index) => {
            return <RecordItem key={index} item={record} />;
          })}
        </div>
        {status === 'READY' && (
          <div className='btn-start-wrapper'>
            <button className='btn-start' onClick={handleClickReady}>
              시 작
            </button>
          </div>
        )}
      </div>

      {status === 'EXERCISING' && (
        <>
          <p>운동 중</p>
          <button onClick={handleClickRest}>휴식</button>
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
              value={records[currentOrder].count}
              onChange={handleChangeCount}
            />
          </p>
        </div>
      )}
    </div>
  );
};

export default Monday;
