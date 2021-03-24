import { useCallback, useEffect, useState } from 'react';

import Layout from '../components/Layout';
import { Member } from '../interfaces';
import axios from 'axios';

interface LoginPageProps {
  profiles?: Member[];
}

const LoginPage = ({ ...props }: LoginPageProps) => {
  const [profiles, setProfiles] = useState<Member[]>([]);

  const [nickname, setNickname] = useState<string>('');

  const handleChangeNickname = (e: any) => {
    setNickname(e.target.value);
  };

  const handleClickAdd = useCallback(async () => {
    try {
      const res = await axios.post('/api/profile', { nickname });
      if (res && res.data) {
        const { profile } = res.data;
        setProfiles([...profiles, profile]);
        setNickname('');
      }
    } catch (error) {
      throw error;
    }
  }, [nickname]);

  const getProfiles = useCallback(async () => {
    try {
      const res = await axios.get('/api/profile');
      if (res && res.data) {
        const { profiles } = res.data;
        setProfiles(profiles);
      }
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!props.profiles) getProfiles();
  }, []);

  return (
    <Layout title='Login'>
      <div>
        {profiles.map((profile) => {
          return <div key={`${profile.id}`}>{profile.nickname}</div>;
        })}
      </div>
      {profiles.length < 4 && (
        <>
          <input type='text' value={nickname} onChange={handleChangeNickname} />
          <button onClick={handleClickAdd}>+</button>
        </>
      )}
    </Layout>
  );
};

export default LoginPage;
