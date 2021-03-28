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

interface Count {
  prev?: number;
  current: number;
  isSuccessed: boolean;
  isDone: boolean;
  isSaved: boolean;
}

const Tuesday = ({ date }: TuesdayProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const [status, setStatus] = useState<Status>('READY');
  const [counts, setCounts] = useState<Count[]>([]);

  const currentSet = useMemo(() => counts.length, [counts]);

  const [isFailed, restTime] = useMemo(() => {
    const index = counts.findIndex(({ isSuccessed }) => !isSuccessed);
    const isFailed = index !== -1;
    return [isFailed, index === -1 ? counts.length : (index + 1) * 10];
  }, [counts]);

  const handleClickReady = useCallback(() => {
    setStatus('EXERCISING');
  }, []);

  const handleClickSuccess = useCallback(() => {
    setCounts([
      ...counts,
      {
        current: counts.length + 1,
        isSuccessed: true,
        isDone: true,
        isSaved: false,
      },
    ]);
    setStatus('REST');
  }, [counts]);

  const handleClickFail = useCallback(() => {
    setCounts([
      ...counts,
      {
        current: counts.length,
        isSuccessed: false,
        isDone: true,
        isSaved: false,
      },
    ]);
    setStatus('REST');
  }, [counts]);

  const handleClickFinish = useCallback(() => {
    setStatus('COMPLETE');
  }, []);

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

  const handleEndTimer = useCallback(() => {
    if (isFailed) {
      const { length } = counts;
      setCounts([
        ...counts,
        {
          ...counts[length - 1],
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
      const newCounts = [...counts];
      newCounts[currentSet - 1].current = isNaN(count) ? 0 : count;
      setCounts(newCounts);
    },
    [currentSet, counts]
  );

  useEffect(() => {
    if (currentSet === 0) return;
    const index = currentSet === -1 ? 4 : currentSet - 1;
    const prevSetCount = counts[index];
    if (prevSetCount.isDone && !prevSetCount.isSaved) {
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

  return (
    <div>
      <PushUp date={date} />
      <p>Pyramid</p>
      {counts.map((count: Count, index) => {
        return <span key={index}>{`${count.current}  `}</span>;
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
                value={counts[currentSet - 1].current}
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
                value={counts[currentSet - 1].current}
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
