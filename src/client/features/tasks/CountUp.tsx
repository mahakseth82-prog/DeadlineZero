import React, { useEffect, useState } from 'react';

interface CountUpProps {
  to: number;
  duration?: number;
  suffix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({ to, duration = 1000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * to));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(to);
      }
    };
    window.requestAnimationFrame(step);
  }, [to, duration]);

  return <span>{count}{suffix}</span>;
};
