import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Clock from './Clock';
import CountInput from './CountInput';
import Head from 'next/head';
import Link from 'next/link';
import { Member } from '../interfaces';
import { signOutAction } from '../reducers/member';

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const dispatch = useDispatch();

  const handleClickLogout = () => {
    // const action = signOutAction();
    // console.log(action);
    // console.log(signOutAction());
    dispatch(signOutAction());
    // console.log('handleClickLogout');
  };

  return (
    <div className='container'>
      <Head>
        <title>{`${title} | Armstrong Pullup Program`}</title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        <link
          href={`https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap`}
          rel='stylesheet'
        />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link
          href='https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap'
          rel='stylesheet'
        />
      </Head>
      <header>
        <nav>
          <Link href='/'>
            <span>Record</span>
          </Link>
          {member.id !== 0 && <span onClick={handleClickLogout}>log out</span>}
          <Clock />
        </nav>
      </header>
      {children}
      <CountInput />
    </div>
  );
};

export default Layout;
