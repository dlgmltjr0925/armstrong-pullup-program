import { Member, Record } from '../interfaces';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PushUpItem from './PushUpItem';
import axios from 'axios';
import dateFormat from 'dateformat';
import { setCountInputAction } from '../reducers/countInput';

interface PushUpProps {
  date: Date;
}

interface RecordState {
  id?: number;
  prev: number;
  count: number;
  isDone: boolean;
  isSaved: boolean;
}

const getInitialRecords = (): RecordState[] =>
  Array.from({ length: 3 }, () => ({
    prev: 0,
    count: 0,
    isDone: false,
    isSaved: false,
  }));

const PushUp = ({ date }: PushUpProps) => {
  const member = useSelector(({ member }: { member: Member }) => member);
  const dispatch = useDispatch();

  const [records, setRecords] = useState<RecordState[]>(getInitialRecords());

  const getRecord = useCallback(async () => {
    const newRecords = getInitialRecords();
    try {
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - (prevDate.getDay() === 1 ? 3 : 1));
      const prev = dateFormat(prevDate, 'yyyymmdd');
      let res = await axios.get(`/api/pushup/${member.id}/${prev}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        records.forEach(({ order, count }: Record) => {
          const index = order - 1;
          newRecords[index].prev = count;
        });
      }

      const today = dateFormat(date, 'yyyymmdd');
      res = await axios.get(`/api/pushup/${member.id}/${today}`);

      if (res && res.status === 200) {
        const { records } = res.data;
        records.forEach(({ id, order, count }: Record) => {
          const index = order - 1;
          newRecords[index].id = id;
          newRecords[index].count = count;
          newRecords[index].isDone = true;
          newRecords[index].isSaved = true;
        });
      }

      setRecords(newRecords);
    } catch (error) {
      throw error;
    }
  }, [date]);

  const handleClickItem = (index: number) => {
    return () => {
      const isActive = index === 0 || records[index - 1].count !== 0;
      if (!isActive) return;
      dispatch(
        setCountInputAction({
          count: records[index].prev,
          onClickConfirm: (count: number) => {
            const newRecords = [...records];
            newRecords[index].count = count;
            newRecords[index].isDone = true;
            newRecords[index].isSaved = false;
            setRecords(newRecords);
          },
        })
      );
    };
  };

  const updateRecord = useCallback(
    async (record: Record): Promise<Record | void> => {
      try {
        const res = await axios.put(`/api/record/${member.id}`, { record });
        if (res && res.status === 200) {
          return res.data.record;
        }
      } catch (error) {
        throw error;
      }
    },
    [member]
  );

  const enrollRecord = useCallback(
    async (record: Omit<Record, 'id'>): Promise<Record | void> => {
      try {
        const res = await axios.post(`/api/record/${member.id}`, { record });
        if (res && res.status === 200) {
          return res.data.record;
        } else if (res && res.status === 202) {
          const { id } = res.data;
          return (await updateRecord({ id, ...record })) as Record;
        }
      } catch (error) {
        throw error;
      }
    },
    [member]
  );

  const sync = useCallback(async () => {
    try {
      const index = records.findIndex(
        ({ isDone, isSaved }) => isDone && !isSaved
      );
      if (index === -1) return;
      Promise.all(
        records.map(async ({ id, count, isDone, isSaved }, index) => {
          if (!isDone || isSaved) return null;
          const newRecord: Omit<Record, 'id'> = {
            date: dateFormat(date, 'yyyymmdd'),
            type: 'PUSH_UP',
            count,
            order: index + 1,
          };
          if (id) {
            return await updateRecord({ id, ...newRecord });
          } else {
            return await enrollRecord(newRecord);
          }
        })
      ).then((results) => {
        let willBeUpdate = false;
        const newRecords = [...records];
        results.forEach((result, index) => {
          if (result === null) return;
          if (!willBeUpdate) willBeUpdate = true;
          newRecords[index].isSaved = true;
        });
        if (willBeUpdate) setRecords(newRecords);
      });
    } catch (error) {
      throw error;
    }
  }, [records]);

  useEffect(() => {
    sync();
  }, [records]);

  useEffect(() => {
    getRecord();
  }, [date]);

  return (
    <div className='push-up-container'>
      <p className='category'>Push Up</p>
      <div className='push-up-wrapper'>
        {records.map((record, index) => {
          const isActive = index === 0 || records[index - 1].count !== 0;
          return (
            <PushUpItem
              key={index}
              record={record}
              isActive={isActive}
              onClick={handleClickItem(index)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PushUp;
