import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Clock from './Clock';
import CountInput from './CountInput';
import Head from 'next/head';
import { Member } from '../interfaces';
import { signOutAction } from '../reducers/member';
import { useRouter } from 'next/dist/client/router';

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleClickLogout = () => {
    dispatch(signOutAction());
  };

  const handleClickRecord = () => {
    if (member.id !== 0) router.push('/');
  };

  return (
    <div className="container">
      <div>
        <Head>
          <title>{`${title} | Armstrong Pullup Program`}</title>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <link
            href={`https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap`}
            rel="stylesheet"
          />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap"
            rel="stylesheet"
          />
        </Head>
        <header>
          <nav>
            <span onClick={handleClickRecord}>Record</span>
            {member.id !== 0 && (
              <span onClick={handleClickLogout}>log out</span>
            )}
            <Clock />
          </nav>
        </header>
        {children}
      </div>
      <CountInput />
    </div>
  );
};

export default Layout;
