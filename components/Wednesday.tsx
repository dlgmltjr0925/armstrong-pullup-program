import { Member, Record, Status } from '../interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import RecordItem from './RecordItem';
import Timer from './Timer';
import axios from 'axios';
import dateFormat from 'dateformat';
import { setCountInputAction } from '../reducers/countInput';

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

const getInitialRecords = (count = 1) =>
  Array.from({ length: 9 }, () => ({
    count,
    isDone: false,
    isSaved: false,
  }));

const Wednesday = ({ date }: WednesdayProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const dispatch = useDispatch();

  const [status, setStatus] = useState<Status>('INITIAL');
  const [records, setRecords] = useState<WednesdayRecord[]>(
    getInitialRecords()
  );
  const [timeOut, setTimeOut] = useState<Date>(new Date());

  const currentOrder = useMemo(
    () => records.findIndex(({ isDone }) => !isDone),
    [records]
  );

  const type = useMemo(() => {
    if (currentOrder < 3) return 'Pulling Up';
    else if (currentOrder < 6) return 'Chining up';
    else return 'Wide \nPulling Up';
  }, [currentOrder]);

  const handleClickReady = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const handleClickRest = useCallback(() => {
    let timeOut = undefined;
    if (currentOrder !== 8) {
      timeOut = new Date();
      timeOut.setSeconds(timeOut.getSeconds() + REST_TIME);
      setTimeOut(timeOut);
    }
    dispatch(
      setCountInputAction({
        count: records[currentOrder].count,
        max: records[currentOrder].count,
        timeOut,
        onClickConfirm: (count: number) => {
          const newRecords = [...records];
          newRecords[currentOrder].count = count;
          newRecords[currentOrder].isDone = true;
          setRecords(newRecords);
        },
      })
    );
    setStatus(currentOrder !== 8 ? 'REST' : 'COMPLETE');
  }, [records, currentOrder]);

  const handleEndTimer = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const getRecords = useCallback(async () => {
    try {
      const diff = date.getDay() === 3 ? 0 : 2;
      let goal = 1;
      const lastWeekDate = new Date(date);
      lastWeekDate.setDate(lastWeekDate.getDate() - 6 - diff);
      const lastWeek = dateFormat(lastWeekDate, 'yyyymmdd');
      let res = await axios.get(`/api/record/${member.id}/${lastWeek}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        if (records.length === 0) {
          const firstDate = new Date(date);
          firstDate.setDate(firstDate.getDate() - 2 - diff);
          const first = dateFormat(firstDate, 'yyyymmdd');
          res = await axios.get(`/api/record/${member.id}/${first}`);

          if (res && res.status === 200) {
            const { records } = res.data;
            let max = 0;
            records.forEach(({ count }: Record) => {
              if (count > max) max = count;
            });
            goal = Math.floor(max / 2);
          }
        } else if (records.length <= 9) {
          goal = records[0].count;
        } else {
          goal = records[0].count + 1;
        }
      }

      const newRecords = getInitialRecords(goal);

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
      <div id='record' className='record-container'>
        <h1 className='category'>3그립</h1>
        <p className='describe'>
          풀업, 친업, 와이드 풀업을 각 3세트, 쉬는 시간 : 60초
        </p>
        <div className='record-wrapper wednesday-wrapper'>
          <p className='sub-category'>Pull Up</p>
          <div className='sub-record-wrapper'>
            {status !== 'INITIAL' &&
              records.slice(0, 3).map((record, index) => {
                return <RecordItem key={index} item={record} />;
              })}
          </div>
        </div>
        <div className='record-wrapper wednesday-wrapper'>
          <p className='sub-category'>Chin Up</p>
          <div className='sub-record-wrapper'>
            {status !== 'INITIAL' &&
              records.slice(3, 6).map((record, index) => {
                return <RecordItem key={index} item={record} />;
              })}
          </div>
        </div>
        <div className='record-wrapper wednesday-wrapper'>
          <p className='sub-category'>Wide Pull Up</p>
          <div className='sub-record-wrapper'>
            {status !== 'INITIAL' &&
              records.slice(6, 9).map((record, index) => {
                return <RecordItem key={index} item={record} />;
              })}
          </div>
        </div>
        {status === 'READY' && (
          <div className='btn-start-wrapper'>
            <button className='btn-start no-drag' onClick={handleClickReady}>
              {currentOrder === 0 ? 'Start' : 'Resume'}
            </button>
          </div>
        )}
      </div>
      {(status === 'EXERCISING' || status === 'REST') && (
        <div className='recording-container record-container'>
          <h1 className='category'>3그립 3세트(풀업, 친업, 와이드 풀업)</h1>
          <p className='describe'>쉬는 시간 : 60초</p>
          <div className='record-wrapper wednesday-wrapper'>
            <p className='sub-category'>Pull Up</p>
            <div className='sub-record-wrapper'>
              {records.slice(0, 3).map((record, index) => {
                return <RecordItem key={index} item={record} />;
              })}
            </div>
          </div>
          <div className='record-wrapper wednesday-wrapper'>
            <p className='sub-category'>Chin Up</p>
            <div className='sub-record-wrapper'>
              {records.slice(3, 6).map((record, index) => {
                return <RecordItem key={index} item={record} />;
              })}
            </div>
          </div>
          <div className='record-wrapper wednesday-wrapper'>
            <p className='sub-category'>Wide Pull Up</p>
            <div className='sub-record-wrapper'>
              {records.slice(6, 9).map((record, index) => {
                return <RecordItem key={index} item={record} />;
              })}
            </div>
          </div>
          {status === 'REST' ? (
            <div className='btn-status timer-wrapper'>
              <Timer timeOut={timeOut} onEnd={handleEndTimer} />
            </div>
          ) : (
            <>
              <div className='btn-status excersizing' onClick={handleClickRest}>
                <pre className='btn-status-excersize'>{type}</pre>
              </div>

              <p className='btn-describe'>세트가 끝나면 누르세요</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Wednesday;
