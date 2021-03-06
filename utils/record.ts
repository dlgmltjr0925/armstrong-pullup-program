import { Data, Record } from '../interfaces';

import fs from 'fs';
import getConfig from 'next/config';
import path from 'path';

interface FindRecordByDateInput {
  memberId: number;
  date: string;
}

interface InsertRecordInput extends Omit<Record, 'id'> {
  memberId: number;
}

interface UpdateRecordInput extends Record {
  memberId: number;
}

interface DeleteRecordInput {
  memberId: number;
  id: number;
}

const { serverRuntimeConfig } = getConfig();

export const getRecordPath = (memberId: number) => {
  return path.join(serverRuntimeConfig.PROJECT_ROOT, `data/${memberId}.json`);
};

const getRecordData = (memberId: number): Data<Record> => {
  try {
    const path = getRecordPath(memberId);
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify({ increment: 0, data: [] }), {
        encoding: 'utf-8',
      });
    }

    const data = fs.readFileSync(path, 'utf-8');
    return JSON.parse(data) as Data<Record>;
  } catch (error) {
    throw error;
  }
};

const save = (memberId: number, recordData: Data<Record>) => {
  try {
    const path = getRecordPath(memberId);
    fs.writeFileSync(path, JSON.stringify(recordData, null, 2), {
      encoding: 'utf-8',
    });
  } catch (error) {
    throw error;
  }
};

export const findRecordByDate = ({
  memberId,
  date,
}: FindRecordByDateInput): Record[] => {
  try {
    const recordData = getRecordData(memberId);
    return recordData.data.filter(
      (record) => record.date === date && record.type !== 'PUSH_UP'
    );
  } catch (error) {
    throw error;
  }
};

export const findPushUpRecordByDate = ({
  memberId,
  date,
}: FindRecordByDateInput): Record[] => {
  try {
    const recordData = getRecordData(memberId);
    return recordData.data.filter(
      (record) => record.date === date && record.type === 'PUSH_UP'
    );
  } catch (error) {
    throw error;
  }
};

export const insertRecord = ({
  memberId,
  ...record
}: InsertRecordInput): Record | number => {
  try {
    const recordData = getRecordData(memberId);
    const index = recordData.data.findIndex(
      (data) =>
        data.date === record.date &&
        data.order === record.order &&
        data.type === record.type
    );
    if (index !== -1) return recordData.data[index].id;
    const newRecord = {
      id: ++recordData.increment,
      ...record,
    };
    recordData.data.push(newRecord);
    save(memberId, recordData);
    return newRecord;
  } catch (error) {
    throw error;
  }
};

export const updateRecord = ({
  memberId,
  ...record
}: UpdateRecordInput): Record | null => {
  try {
    const recordData = getRecordData(memberId);
    const index = recordData.data.findIndex(({ id }) => id === record.id);
    if (index === -1) return null;
    recordData.data[index] = record;
    save(memberId, recordData);
    return record;
  } catch (error) {
    throw error;
  }
};

export const deleteRecord = ({ memberId, id }: DeleteRecordInput) => {
  try {
    const recordData = getRecordData(memberId);
    const record = recordData.data.find((record) => record.id === id);

    if (!record) return null;
    recordData.data = recordData.data.filter((record) => record.id !== id);
    save(memberId, recordData);
    return record;
  } catch (error) {
    throw error;
  }
};
