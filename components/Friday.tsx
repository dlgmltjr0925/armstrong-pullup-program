import { useCallback, useEffect, useMemo, useState } from 'react';

import { Member } from '../interfaces';
import Monday from './Monday';
import Thursday from './Thursday';
import Tuesday from './Tuesday';
import Wednesday from './Wednesday';
import axios from 'axios';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';

interface FridayProps {
  date: Date;
}

const Friday = ({ date }: FridayProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const [dayOfWeek, setDayOfWeek] = useState<number>(-1);

  const handleClickClass = useCallback((dayOfWeek) => {
    return () => {
      setDayOfWeek(dayOfWeek);
    };
  }, []);

  const getRecords = useCallback(async () => {
    try {
      const today = dateFormat(date, 'yyyymmdd');
      const res = await axios.get(`/api/record/${member.id}/${today}`);
      if (res && res.status === 200) {
        const { records } = res.data;
        if (records.length > 0) {
          const { type } = records[0];
          switch (type) {
            case 'MAX_COUNT':
              setDayOfWeek(1);
              break;
            case 'PYRAMID':
              setDayOfWeek(2);
              break;
            case 'THREE_GRIP':
              setDayOfWeek(3);
              break;
            case 'MAX_SET':
              setDayOfWeek(4);
              break;
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }, [member, date]);

  useEffect(() => {
    getRecords();
  }, []);

  const WeekComponent = useMemo(() => {
    switch (dayOfWeek) {
      case 1:
        return Monday;
      case 2:
        return Tuesday;
      case 3:
        return Wednesday;
      case 4:
        return Thursday;
      default:
        return () => (
          <div id='record' className='record-container'>
            <h1 className='category'>복습</h1>
            <p className='describe'>루틴 중 가장 힘들었던 날의 루틴을 실시</p>
            <div className='friday-wrapper'>
              <div className='btn-friday-item' onClick={handleClickClass(1)}>
                풀업 5세트
              </div>
              <div className='btn-friday-item' onClick={handleClickClass(2)}>
                피라미드 루틴
              </div>
            </div>
            <div className='friday-wrapper'>
              <div className='btn-friday-item' onClick={handleClickClass(3)}>
                3그립
              </div>
              <div className='btn-friday-item' onClick={handleClickClass(4)}>
                최대 세트수
              </div>
            </div>
          </div>
        );
    }
  }, [dayOfWeek]);

  return (
    <div>
      <WeekComponent date={date} />
    </div>
  );
};

export default Friday;
