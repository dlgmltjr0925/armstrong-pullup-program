import { useEffect, useState } from 'react';

const useWindowSize = () => {
  const isClient = typeof window === 'object';

  const getSize = () => ({
    width: isClient ? window.innerWidth : 0,
    height: isClient ? window.innerHeight : 0,
  });

  const [windowSize, setWindowSize] = useState(getSize());

  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      setWindowSize(getSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  return windowSize;
};

export default useWindowSize;
