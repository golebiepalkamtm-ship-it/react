const isProd = process.env.NODE_ENV === 'production';

function noop() {}

const logger = {
  debug: isProd ? noop : (...args) => console.debug?.(...args),
  info: isProd ? noop : (...args) => console.info?.(...args),
  warn: (...args) => console.warn?.(...args),
  error: (...args) => console.error?.(...args),
};

export default logger;
