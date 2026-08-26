import { useState, useEffect } from 'react';
import { DisplayFeedData } from '../types';

export function useNowServingFeed() {
  const [feed, setFeed] = useState<DisplayFeedData | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const fetchDisplay = async () => {
      try {
        const res = await fetch('/api/display/now-serving');
        const data = await res.json();
        if (data.success) {
          setFeed(data);
        }
      } catch (err) {
        console.error('Failed to load now-serving feed', err);
      }
    };

    fetchDisplay();
    const interval = setInterval(fetchDisplay, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return { feed, currentTime };
}
