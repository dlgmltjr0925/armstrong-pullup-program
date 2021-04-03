import {
  faChevronCircleLeft,
  faChevronCircleRight,
} from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Friday from '../components/Friday';
import Holiday from '../components/Holiday';
import Layout from '../components/Layout';
import { MemberState } from '../reducers/member';
import Monday from '../components/Monday';
import Thursday from '../components/Thursday';
import Tuesday from '../components/Tuesday';
import Wednesday from '../components/Wednesday';
import dateFormat from 'dateformat';
import { useRouter } from 'next/dist/client/router';
import { useSelector } from 'react-redux';

const week = ['일', '월', '화', '수', '목', '금', '토', '일'];

const TodayPage = () => {
  const router = useRouter();
  const member = useSelector(({ member }: { member: MemberState }) => member);

  useEffect(() => {
    if (member.id === 0) router.replace('/login');
  }, [member.id]);

  const [date, setDate] = useState<Date>(new Date());

  const handleClickPrev = useCallback(() => {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    setDate(prevDate);
  }, [date]);

  const handleClickNext = useCallback(() => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    setDate(nextDate);
  }, [date]);

  const dayOfWeek = useMemo(() => date.getDay(), [date]);

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
      case 5:
        return Friday;
      default:
        return Holiday;
    }
  }, [dayOfWeek]);

  return (
    <Layout title='Home'>
      {member.id !== 0 && (
        <>
          <div className='day-select-container'>
            <div className='day-select-wrapper'>
              <span>{`${dateFormat(date, 'yyyy년 m월 dd일')} (${
                week[date.getDay()]
              })`}</span>
              <div>
                <button className='btn prev' onClick={handleClickPrev}>
                  <FontAwesomeIcon
                    className='icon'
                    icon={faChevronCircleLeft}
                  />
                </button>
                <button className='btn next' onClick={handleClickNext}>
                  <FontAwesomeIcon
                    className='icon'
                    icon={faChevronCircleRight}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className='week-container'>
            <WeekComponent date={date} />
          </div>
        </>
      )}
    </Layout>
  );
};

export default TodayPage;
