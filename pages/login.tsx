import { useCallback, useEffect, useState } from 'react';

import { GetServerSideProps } from 'next';
import { Member } from '../interfaces';
import axios from 'axios';
import { getAllProfiles } from '../utils/profile';

interface LoginPageProps {
  profiles?: Member[];
}

const LoginPage = ({ ...props }: LoginPageProps) => {
  const [profiles, setProfiles] = useState<Member[]>(props.profiles || []);

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

  console.log(profiles);

  return (
    <div>
      {profiles.map((profile) => {
        return <div key={`${profile.id}`}>{profile.nickname}</div>;
      })}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const profiles = getAllProfiles();

  console.log(profiles);

  return {
    props: {
      profiles,
    },
  };
};

export default LoginPage;
