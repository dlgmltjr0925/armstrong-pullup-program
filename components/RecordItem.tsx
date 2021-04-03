import { useMemo } from 'react';

interface Item {
  prev?: number;
  count: number;
  isDone: boolean;
  isSaved: boolean;
}

interface RecordItemProps {
  item: Item;
}

const RecordItem = ({ item }: RecordItemProps) => {
  const { count, isDone, isSaved } = item;

  const cn = useMemo<string>(() => {
    if (!isDone) return 'ready';
    else if (!isSaved) return 'not-update';
    else return 'complete';
  }, [isDone, isSaved]);

  return (
    <div className={`record-item ${cn}`}>
      <span>{count}</span>
    </div>
  );
};

export default RecordItem;
