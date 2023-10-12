import { useCallback, useEffect, useRef, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Layout from '../components/Layout';
import { Member } from '../interfaces';
import MemberItem from '../components/MemberItem';
import axios from 'axios';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { signInAction } from '../reducers/member';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/dist/client/router';

interface LoginPageProps {
  profiles?: Member[];
}

const LoginPage = ({ ...props }: LoginPageProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const nicknameEl = useRef<HTMLInputElement>(null);

  const [profiles, setProfiles] = useState<Member[]>([]);

  const [nickname, setNickname] = useState<string | null>(null);

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
    if (nickname === null) {
      setNickname('');
    } else {
      if (nicknameEl.current) nicknameEl.current.focus();
    }
  }, [nickname]);

  const handleBlurAdd = useCallback(async () => {
    if (nickname === null) return;
    else if (nickname.trim() === '') {
      setNickname(null);
    } else {
      try {
        const result = confirm(`[${nickname}]으로 생성하시겠습니까?`);
        if (!result) {
          setNickname(null);
        } else {
          const res = await axios.post('/api/profile', { nickname });
          if (res && res.data) {
            const { profile } = res.data;
            setProfiles([...profiles, profile]);
            setNickname(null);
          }
        }
      } catch (error) {
        throw error;
      }
    }
  }, [nickname, profiles]);

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
    dispatch(signInAction(profile));
    router.replace('/');
  }, []);

  useEffect(() => {
    if (!props.profiles) getProfiles();
  }, []);

  return (
    <Layout title="Login">
      <div className="member-list">
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
        {profiles.length < 4 && (
          <button className="member-item new-item" onClick={handleClickAdd}>
            {nickname === null ? (
              <FontAwesomeIcon className="icon-plus" icon={faPlus} />
            ) : (
              <input
                ref={nicknameEl}
                className="new-nickname"
                type="text"
                placeholder="nickname"
                autoFocus
                value={nickname}
                onChange={handleChangeNickname}
                onBlur={handleBlurAdd}
              />
            )}
          </button>
        )}
      </div>
    </Layout>
  );
};

export default LoginPage;
