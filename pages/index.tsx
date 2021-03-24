import { useEffect, useMemo, useState } from 'react';

import Friday from '../components/Friday';
import Holiday from '../components/Holiday';
import Layout from '../components/Layout';
import { MemberState } from '../reducers/member';
import Monday from '../components/Monday';
import Thursday from '../components/Thursday';
import Tuesday from '../components/Tuesday';
import Wednesday from '../components/Wednesday';
import { useRouter } from 'next/dist/client/router';
import { useSelector } from 'react-redux';

const TodayPage = () => {
  const router = useRouter();
  const member = useSelector(({ member }: { member: MemberState }) => member);

  useEffect(() => {
    if (member.id === 0) router.replace('/login');
  }, [member.id]);

  if (member.id === 0) return null;

  const [now, setNow] = useState<Date>(new Date());

  const [day, setDay] = useState<number>(now.getDay());
  // const [day] = useState<number>(1);

  const WeekComponent = useMemo(() => {
    switch (day) {
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
  }, [day]);

  return (
    <Layout title='Today'>
      <button onClick={() => setDay(day === 0 ? 6 : day - 1)}>이전</button>
      <button onClick={() => setDay(day === 6 ? 0 : day + 1)}>다음</button>
      <WeekComponent />
    </Layout>
  );
};

export default TodayPage;
