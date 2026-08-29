export const logger = {
  info: (event: string, meta: Record<string, any> = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      event,
      ...meta
    }));
  },
  warn: (event: string, meta: Record<string, any> = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      event,
      ...meta
    }));
  },
  error: (event: string, meta: Record<string, any> = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      event,
      ...meta
    }));
  }
};
