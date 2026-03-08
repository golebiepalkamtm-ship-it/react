const isProd = process.env.NODE_ENV === 'production';

type LogArg = unknown;

function formatArgs(args: LogArg[]): LogArg[] {
  return args.map((arg) => {
    if (arg instanceof Error) {
      return isProd ? arg.message : arg.stack;
    }
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg, (key, value) => {
          if (value instanceof Error) {
            return {
              name: value.name,
              message: value.message,
              stack: value.stack,
              code: (value as any).code
            };
          }
          const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
          if (typeof key === 'string' && sensitiveFields.includes(key.toLowerCase())) return '***';
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
  debug: isProd ? (..._args: LogArg[]) => {} : (...args: LogArg[]) => console.debug?.(...(formatArgs(args) as [])),
  info: (...args: LogArg[]) => console.info?.(...(formatArgs(args) as [])),
  warn: (...args: LogArg[]) => console.warn?.(...(formatArgs(args) as [])),
  error: (...args: LogArg[]) => console.error?.(...(formatArgs(args) as [])),
};

export default logger;
