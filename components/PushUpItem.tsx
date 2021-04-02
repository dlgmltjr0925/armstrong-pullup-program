import { DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';

interface Record {
  prev: number;
  count: number;
  isSaved: boolean;
}

interface PushUpItemProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  record: Record;
  isActive: boolean;
}

const PushUpItem = ({ record, isActive, ...props }: PushUpItemProps) => {
  const { prev, count, isSaved } = record;

  const cn = useMemo<string>(() => {
    if (!isActive) return 'inactive';
    else if (count === 0) return 'ready';
    else if (!isSaved) return 'not-update';
    else return 'update';
  }, [count, isActive, isSaved]);

  return (
    <div className={`push-up-item no-drag ${cn}`} {...props}>
      <span>{count}</span>
    </div>
  );
};

export default PushUpItem;
