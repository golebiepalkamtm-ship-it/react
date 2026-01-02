const isProd = process.env.NODE_ENV === 'production';

function noop() {}

const logger = {
  debug: isProd ? noop : (...args: unknown[]) => console.debug?.(...args),
  info: isProd ? noop : (...args: unknown[]) => console.info?.(...args),
  warn: (...args: unknown[]) => console.warn?.(...args),
  error: (...args: unknown[]) => console.error?.(...args),
};

export default logger;
