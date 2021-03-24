import { Data, Member } from '../interfaces';

import fs from 'fs';
import getConfig from 'next/config';
import path from 'path';

const { serverRuntimeConfig } = getConfig();

export const MEMBER_FILE_PATH = path.join(
  serverRuntimeConfig.PROJECT_ROOT,
  'data/member.json'
);

let memberData: Data<Member> | null = null;

const getMemberData = (): Data<Member> => {
  try {
    if (memberData === null) {
      if (!fs.existsSync(MEMBER_FILE_PATH)) {
        fs.writeFileSync(
          MEMBER_FILE_PATH,
          JSON.stringify({ increment: 0, data: [] }),
          { encoding: 'utf-8' }
        );
      }

      const data = fs.readFileSync(MEMBER_FILE_PATH, 'utf-8');
      memberData = JSON.parse(data) as Data<Member>;
    }
    return memberData;
  } catch (error) {
    throw error;
  }
};

const save = (memberData: Data<Member>) => {
  try {
    fs.writeFileSync(MEMBER_FILE_PATH, JSON.stringify(memberData), {
      encoding: 'utf-8',
    });
  } catch (error) {
    throw error;
  }
};

export const getAllProfiles = (): Member[] => {
  try {
    const memberData = getMemberData();
    return memberData.data;
  } catch (error) {
    throw error;
  }
};

export const insertProfile = (nickname: string): Member => {
  try {
    const memberData = getMemberData();
    const newMember = {
      id: ++memberData.increment,
      nickname,
    };
    memberData.data.push(newMember);
    save(memberData);
    return newMember;
  } catch (error) {
    throw error;
  }
};
