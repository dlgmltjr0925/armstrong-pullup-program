import { Member, Record, Status } from '../interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PushUp from './PushUp';
import RecordItem from './RecordItem';
import Timer from './Timer';
import axios from 'axios';
import dateFormat from 'dateformat';
import { setCountInputAction } from '../reducers/countInput';

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
  const dispatch = useDispatch();

  const [status, setStatus] = useState<Status>('INITIAL');
  const [records, setRecords] = useState<ThursdayRecord[]>([]);
  const [goal, setGoal] = useState<number>(1);
  const [timeOut, setTimeOut] = useState<Date>(new Date());

  const currentOrder = useMemo(() => records.length, [records]);

  const handleClickReady = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const handleClickSuccess = useCallback(() => {
    const newRecords = [
      ...records,
      {
        count: goal,
        isDone: true,
        isSaved: false,
      },
    ];
    const timeOut = new Date();
    timeOut.setSeconds(timeOut.getSeconds() + REST_TIME);
    setTimeOut(timeOut);
    setRecords(newRecords);
    setStatus('REST');
  }, [records, goal]);

  const handleClickFail = useCallback(() => {
    const newRecords = [
      ...records,
      {
        count: goal - 1,
        isDone: false,
        isSaved: false,
      },
    ];
    const index = records.length;
    dispatch(
      setCountInputAction({
        count: goal - 1,
        max: goal - 1,
        onClickConfirm: (count: number) => {
          newRecords[index].count = count;
          newRecords[index].isDone = true;
          newRecords[index].isSaved = false;
          setRecords(newRecords);
        },
      })
    );
    setStatus('COMPLETE');
  }, [records, goal]);

  const handleEndTimer = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const getRecords = useCallback(async () => {
    try {
      const diff = date.getDay() === 4 ? 0 : 1;
      let goal = 1;
      const yesterdayDate = new Date(date);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1 - diff);
      const yesterday = dateFormat(yesterdayDate, 'yyyymmdd');
      let res = await axios.get(`/api/record/${member.id}/${yesterday}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        let max = 1;
        records.forEach(({ count }: Record) => {
          if (count > max) max = count;
        });
        goal = max;
        setGoal(max);
      }

      const today = dateFormat(date, 'yyyymmdd');
      res = await axios.get(`/api/record/${member.id}/${today}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        const newRecords = records.map(({ id, count }: Record) => ({
          id,
          count,
          isDone: true,
          isSaved: true,
        })) as ThursdayRecord[];
        if (
          newRecords.length !== 0 &&
          newRecords[newRecords.length - 1].count !== goal
        ) {
          setStatus('COMPLETE');
        } else {
          setStatus('READY');
        }
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
      <div id='record' className='record-container'>
        <h1 className='category'>최대 세트수 도전</h1>
        <p className='describe'>
          수요일 반복 횟수로 실패 세트가 나올때까지 실시
        </p>
        <p className='describe'>휴식 시간 : 60초</p>
        <div className='record-wrapper tuesday-wrapper'>
          {records.map((record, index) => (
            <RecordItem key={index} item={record} />
          ))}
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
          <h1 className='category'>최대 세트수</h1>
          <p className='describe'>
            수요일 반복 횟수로 실패 세트가 나올때까지 실시
          </p>
          <p className='describe'>휴식 시간 : 60초</p>
          <div className='record-wrapper tuesday-wrapper'>
            {records.map((record, index) => {
              return <RecordItem key={index} item={record} />;
            })}
          </div>
          {status === 'REST' ? (
            <div className='btn-status timer-wrapper'>
              <Timer timeOut={timeOut} onEnd={handleEndTimer} />
            </div>
          ) : (
            <>
              <div className='btn-status'>
                <p className='btn-status-excersize'>Pulling Up</p>
                <div className='btn btn-fail' onClick={handleClickFail}>
                  실패
                </div>
                <div className='btn btn-success' onClick={handleClickSuccess}>
                  성공
                </div>
              </div>
              <p className='btn-describe'>{`${goal}회 성공하셨나요?`}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Thursday;
