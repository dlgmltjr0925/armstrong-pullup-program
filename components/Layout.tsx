import React, { ReactNode } from 'react';

import Clock from './Clock';
import Head from 'next/head';
import Link from 'next/link';

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <div>
    <Head>
      <title>{`${title} | Recon Ron Pullup Program`}</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      <link
        href={`https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap`}
        rel='stylesheet'
      />
    </Head>
    <header>
      <nav>
        <Link href='/'>
          <a>Today</a>
        </Link>
        <Clock />
      </nav>
    </header>
    {children}
  </div>
);

export default Layout;
