import { useCallback, useEffect, useState } from 'react';

import Layout from '../components/Layout';
import { Member } from '../interfaces';
import { MemberActionType } from '../reducers/member';
import MemberItem from '../components/MemberItem';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/dist/client/router';

interface LoginPageProps {
  profiles?: Member[];
}

const LoginPage = ({ ...props }: LoginPageProps) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [profiles, setProfiles] = useState<Member[]>([]);

  const [nickname, setNickname] = useState<string>('');

  const handleChangeNickname = (e: any) => {
    setNickname(e.target.value);
  };

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

  const handleClickAdd = useCallback(async () => {
    if (nickname.trim() === '') return;
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

  const handleClickDelete = useCallback(
    async (id: number) => {
      try {
        const res = await axios.delete(`/api/profile/${id}`);
        if (res.status === 200 || res.status === 400) {
          console.log();
          setProfiles(profiles.filter((profile) => profile.id !== id));
        }
      } catch (error) {
        throw error;
      }
    },
    [profiles]
  );

  const handleClickProfile = useCallback((profile: Member) => {
    dispatch({
      type: MemberActionType.SIGN_IN,
      payload: profile,
    });
    router.replace('/');
  }, []);

  useEffect(() => {
    if (!props.profiles) getProfiles();
  }, []);

  return (
    <Layout title='Login'>
      <div>
        {profiles.map((profile) => {
          return (
            <MemberItem
              key={`${profile.id}`}
              profile={profile}
              onClickProfile={handleClickProfile}
              onClickDelete={handleClickDelete}
            />
          );
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
