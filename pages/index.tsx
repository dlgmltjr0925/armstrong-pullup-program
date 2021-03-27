import { useCallback, useEffect, useMemo, useState } from 'react';

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

const TodayPage = () => {
  const router = useRouter();
  const member = useSelector(({ member }: { member: MemberState }) => member);

  useEffect(() => {
    if (member.id === 0) router.replace('/login');
  }, [member.id]);

  if (member.id === 0) return null;

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
    <Layout title='Today'>
      <button onClick={handleClickPrev}>Prev</button>
      <span>{dateFormat(date, 'yyyy. mm. dd')}</span>
      <button onClick={handleClickNext}>Next</button>
      <WeekComponent date={date} />
    </Layout>
  );
};

export default TodayPage;
