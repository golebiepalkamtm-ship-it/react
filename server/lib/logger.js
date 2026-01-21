const isProd = process.env.NODE_ENV === 'production';

function formatArgs(args) {
  return args.map(arg => {
    if (arg instanceof Error) {
      return isProd ? arg.message : arg.stack;
    }
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, (key, value) => {
          // Sensitive field masking
          const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
          if (sensitiveFields.includes(key.toLowerCase())) return '***';
          return value;
        });
      } catch {
        return '[Complex Object]';
      }
    }
    return arg;
  });
}

const logger = {
  debug: isProd ? () => {} : (...args) => console.debug?.(...formatArgs(args)),
  info: (...args) => console.info?.(...formatArgs(args)),
  warn: (...args) => console.warn?.(...formatArgs(args)),
  error: (...args) => console.error?.(...formatArgs(args)),
};

export default logger;
