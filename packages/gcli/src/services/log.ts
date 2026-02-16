/* eslint-disable @typescript-eslint/no-explicit-any */
export class Logger {
  public static log(...data: any[]) {
    console.log('\x1b[32m%s\x1b[0m', ...data);
  }

  public static error(...data: any[]) {
    console.error('\x1b[31m%s\x1b[0m', ...data);
  }

  public static info(...data: any[]) {
    console.info('\x1b[36m%s\x1b[0m', ...data);
  }

  public static warn(...data: any[]) {
    console.warn('\x1b[33m%s\x1b[0m', ...data);
  }

  public static table(...data: any[]) {
    console.table(...data);
  }
}
