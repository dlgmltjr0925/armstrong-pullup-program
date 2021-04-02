import { DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';

interface Record {
  prev: number;
  count: number;
}

interface PushUpItemProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  record: Record;
  isActive: boolean;
}

const PushUpItem = ({ record, isActive, ...props }: PushUpItemProps) => {
  const { prev, count } = record;

  const cn = useMemo<string>(() => {
    if (!isActive) return 'inactive';
    else if (count === 0) return 'ready';
    else return 'complete';
  }, [count, isActive]);

  return (
    <div className={`push-up-item no-drag ${cn}`} {...props}>
      <span>{count}</span>
    </div>
  );
};

export default PushUpItem;
