/**
 * Logger Utility
 * System logging and error tracking
 */

export class Logger {
  static log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };

    // Console output
    console.log(JSON.stringify(logEntry));

    // TODO: In production, send to logging service (e.g., Winston, Pino, CloudWatch)
  }

  static info(message, data) {
    this.log('INFO', message, data);
  }

  static error(message, error, data) {
    this.log('ERROR', message, {
      ...data,
      error: {
        message: error?.message,
        stack: error?.stack
      }
    });
  }

  static warn(message, data) {
    this.log('WARN', message, data);
  }

  static debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data);
    }
  }
}

