import { DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';

interface Record {
  prev: number;
  count: number;
  isDone: boolean;
  isSaved: boolean;
}

interface PushUpItemProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  record: Record;
  isActive: boolean;
}

const PushUpItem = ({ record, isActive, ...props }: PushUpItemProps) => {
  const { count, isDone, isSaved } = record;

  const cn = useMemo<string>(() => {
    if (!isActive) return 'inactive';
    else if (!isDone) return 'ready';
    else if (!isSaved) return 'not-update';
    else return 'complete';
  }, [isDone, isActive, isSaved]);

  return (
    <div className={`push-up-item no-drag ${cn}`} {...props}>
      <span>{count}</span>
    </div>
  );
};

export default PushUpItem;
