// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

export interface Member {
  id: number;
  nickname: string;
}

export interface Data<T> {
  increment: number;
  data: T[];
}

export interface Record {
  id: number;
  date: string; // 20210326
  type: 'MAX_COUNT' | 'PYRAMID' | 'THREE_GRIP' | 'MAX_SET' | 'PUSH_UP';
  count: number;
  order: number;
}

export type Status = 'INITIAL' | 'READY' | 'EXERCISING' | 'REST' | 'COMPLETE';
