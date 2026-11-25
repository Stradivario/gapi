/* eslint-disable @typescript-eslint/no-explicit-any */
import { errorText, formatArgs, looksLikeJson, ui } from './ui';

/**
 * The old entry point, kept so every command keeps working; it renders
 * through `ui` (feature cli-output). New code uses `ui` / `step` directly.
 *
 * - `log`: plain text, no symbol - command output, logs, data.
 * - `info` / `success` / `warn` / `error`: `i` / `✔` / `⚠` / `✖` lines
 *   (warn + error on stderr). JSON text is printed as is - it is data.
 * - `table`: aligned columns instead of console.table's box.
 */
export class Logger {
  public static log(...data: any[]) {
    ui.print(formatArgs(data));
  }

  public static info(...data: any[]) {
    const text = formatArgs(data);
    if (looksLikeJson(text)) ui.print(text);
    else ui.info(text);
  }

  public static success(...data: any[]) {
    ui.success(formatArgs(data));
  }

  public static error(...data: any[]) {
    ui.error(data.map(errorText).join(' '));
  }

  public static warn(...data: any[]) {
    ui.warn(formatArgs(data));
  }

  public static table(data: any, columns?: string[]) {
    ui.table(data, columns);
  }
}
