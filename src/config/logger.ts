export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

function sanitize(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(context).filter(([key]) => !/token|secret|key|authorization/i.test(key))
  );
}

export const logger: Logger = {
  info(message, context) {
    console.info(message, sanitize(context));
  },
  warn(message, context) {
    console.warn(message, sanitize(context));
  },
  error(message, context) {
    console.error(message, sanitize(context));
  }
};
