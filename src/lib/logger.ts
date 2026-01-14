type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd = typeof window !== 'undefined' ? import.meta.env.PROD === true : process.env.NODE_ENV === 'production';

function noop(..._args: any[]) {}

const consoleImpl = typeof console !== 'undefined' ? console : { log: noop, info: noop, warn: noop, error: noop, debug: noop } as Console;

export const logger = {
  debug: isProd ? noop : (...args: any[]) => consoleImpl.debug?.(...args),
  info: isProd ? noop : (...args: any[]) => consoleImpl.info?.(...args),
  warn: (...args: any[]) => consoleImpl.warn?.(...args),
  error: (...args: any[]) => consoleImpl.error?.(...args),
};

export function setLogLevel(level: LogLevel) {
  // placeholder for future filtering
}

export default logger;
