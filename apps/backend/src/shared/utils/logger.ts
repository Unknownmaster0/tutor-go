export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string, ...args: any[]) {
    console.log(`[${this.context}] ${message}`, ...args);
  }

  error(message: string, trace?: string, ...args: any[]) {
    console.error(`[${this.context}] ERROR: ${message}`, ...args);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.context}] WARN: ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.context}] DEBUG: ${message}`, ...args);
    }
  }
}
