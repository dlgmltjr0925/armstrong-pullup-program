import { Member, Record, Status } from '../interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PushUp from './PushUp';
import RecordItem from './RecordItem';
import Timer from './Timer';
import axios from 'axios';
import dateFormat from 'dateformat';
import { setCountInputAction } from '../reducers/countInput';

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

const REST_TIME_RATIO = 10; // 10 s

const Tuesday = ({ date }: TuesdayProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const dispatch = useDispatch();

  const [status, setStatus] = useState<Status>('INITIAL');
  const [records, setRecords] = useState<TuesdayRecord[]>([]);
  const [lastWeekMax, setLastWeekMax] = useState<number>(0);
  const [timeOut, setTimeOut] = useState<Date>(new Date());

  const currentOrder = useMemo(() => records.length, [records]);

  const isFailed = useMemo(() => {
    const index = records.findIndex(({ isSuccessed }) => !isSuccessed);
    return index !== -1;
  }, [records]);

  const handleClickReady = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const handleClickSuccess = useCallback(() => {
    const newRecords = [
      ...records,
      {
        count: records.length + 1,
        isSuccessed: true,
        isDone: true,
        isSaved: false,
      },
    ];
    const index = newRecords.findIndex(({ isSuccessed }) => !isSuccessed);
    const restTime = index === -1 ? newRecords.length : index;
    const timeOut = new Date();
    timeOut.setSeconds(timeOut.getSeconds() + restTime * REST_TIME_RATIO);
    setTimeOut(timeOut);
    setRecords(newRecords);
    setStatus('REST');
  }, [records]);

  const handleClickFail = useCallback(() => {
    const newRecords = [
      ...records,
      {
        count: records.length,
        isSuccessed: false,
        isDone: false,
        isSaved: false,
      },
    ];
    const index = records.length;
    const timeOut = new Date();
    timeOut.setSeconds(timeOut.getSeconds() + index * REST_TIME_RATIO);
    setTimeOut(timeOut);
    dispatch(
      setCountInputAction({
        count: records.length,
        max: records.length,
        timeOut,
        onClickConfirm: (count: number) => {
          newRecords[index].count = count;
          newRecords[index].isDone = true;
          newRecords[index].isSaved = false;
          setRecords(newRecords);
        },
      })
    );
    setStatus('REST');
  }, [records, timeOut, dispatch]);

  const handleClickFinish = useCallback(() => {
    if (!isFailed) return;
    let index = records.findIndex(({ isSuccessed }) => !isSuccessed) - 1;
    const newRecords = [
      ...records,
      {
        count: records[index].count,
        isSuccessed: false,
        isDone: false,
        isSaved: false,
      },
    ];
    index = records.length;
    dispatch(
      setCountInputAction({
        count: records.length - 1,
        max: records.length - 1,
        onClickConfirm: (count: number) => {
          newRecords[index].count = count;
          newRecords[index].isDone = true;
          newRecords[index].isSaved = false;
          setRecords(newRecords);
        },
      })
    );
    setStatus('COMPLETE');
  }, [records, timeOut, dispatch]);

  const handleEndTimer = useCallback(() => {
    setStatus('EXERCISING');
  }, [isFailed]);

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
            type: 'PYRAMID',
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
        <h1 className='category'>피라미드 루틴</h1>
        <p className='describe'>세트당 1회씩 증가</p>
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
          <h1 className='category'>피라미드 루틴</h1>
          <p className='describe'>세트당 1회씩 증가</p>
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
              <div className='btn-status' onClick={handleClickFinish}>
                <p className='btn-status-excersize'>Pulling Up</p>
                {!isFailed && (
                  <>
                    <div className='btn btn-fail' onClick={handleClickFail}>
                      실패
                    </div>
                    <div
                      className='btn btn-success'
                      onClick={handleClickSuccess}
                    >
                      성공
                    </div>
                  </>
                )}
              </div>
              {isFailed ? (
                <p className='btn-describe'>세트가 끝나면 누르세요</p>
              ) : (
                <p className='btn-describe'>
                  {`${currentOrder + 1}회 성공하셨나요?`}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Tuesday;
