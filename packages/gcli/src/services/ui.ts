/* eslint-disable @typescript-eslint/no-explicit-any */
import { createInterface } from 'node:readline';
import { format, styleText } from 'node:util';

import {
  defer,
  from,
  interval,
  MonoTypeOperatorFunction,
  Observable,
  Subscription,
  throwError,
} from 'rxjs';
import { finalize, switchMap, tap, toArray } from 'rxjs/operators';

/**
 * Feature cli-output: how gcli talks to people. One vocabulary for every
 * command (Firebase CLI style):
 *
 *   === Deploying api to project shop
 *
 *   i  lambda[api]: uploading archive...
 *   ✔  lambda[api]: archive uploaded (31 KB) 0.8s
 *   ⚠  domains: shop.example.com not applied
 *   ✖  build failed
 *
 *   ✔  Deploy complete!
 *
 *   URL:   https://...
 *
 * Only the symbol and the scope are coloured, the message stays plain.
 * Colour only on a terminal (NO_COLOR / FORCE_COLOR respected, never in a
 * pipe or a file), the spinner only on an interactive terminal outside CI -
 * CI logs get one plain line per step. No dependency: node:util styleText.
 */

type Stream = NodeJS.WriteStream;
type Style = Parameters<typeof styleText>[0];

const env = process.env;

/** Colour for this stream? FORCE_COLOR wins, then NO_COLOR, then a TTY. */
export function colorEnabled(stream: Stream): boolean {
  if (env.FORCE_COLOR !== undefined) {
    return !['0', 'false'].includes(env.FORCE_COLOR);
  }
  return !('NO_COLOR' in env) && !!stream?.isTTY && env.TERM !== 'dumb';
}

/** Animation only for a person watching: a TTY, not CI. */
const interactive = (stream: Stream) =>
  !!stream?.isTTY && !env.CI && env.TERM !== 'dumb';

const unicode =
  process.platform !== 'win32' ||
  !!env.WT_SESSION ||
  env.TERM_PROGRAM === 'vscode';

export const SYMBOLS = unicode
  ? { info: 'i', success: '✔', warn: '⚠', error: '✖', dot: '·' }
  : { info: 'i', success: '√', warn: '‼', error: '×', dot: '-' };

const FRAMES = unicode
  ? ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  : ['-', '\\', '|', '/'];

const ANSI = /\x1b\[[0-9;]*m/g;
export const visibleLength = (text: string) => text.replace(ANSI, '').length;

/** `styles` applied when the stream shows colour. */
export function paint(
  text: string,
  styles: Style[],
  stream: Stream = state.out,
): string {
  if (!colorEnabled(stream) || typeof styleText !== 'function') return text;
  return styles.reduce(
    (t, s) => styleText(s, t, { validateStream: false } as never),
    text,
  );
}

const state: {
  /** human output; stderr under --json so stdout carries only data */
  out: Stream;
  spinner: { text: string; frame: number; sub: Subscription } | null;
} = { out: process.stdout, spinner: null };

/** `--json`: progress goes to stderr, stdout carries only the data. */
export function humanOutputToStderr() {
  state.out = process.stderr;
}

const clearSpinnerLine = () => {
  if (state.spinner) state.out.write('\r\x1b[2K');
};

const drawSpinner = () => {
  const s = state.spinner;
  if (!s) return;
  const frame = paint(FRAMES[s.frame % FRAMES.length], ['cyan']);
  state.out.write(`\r\x1b[2K${frame}  ${s.text}`);
};

/** Writes whole lines; a running spinner is cleared first and redrawn. */
function write(stream: Stream, text: string) {
  const shared = state.spinner && stream === state.out;
  if (shared) clearSpinnerLine();
  stream.write(text.endsWith('\n') ? text : `${text}\n`);
  if (shared) drawSpinner();
}

type Kind = 'info' | 'success' | 'warn' | 'error';

const KIND_STYLE: Record<Kind, Style[]> = {
  info: ['cyan', 'bold'],
  success: ['green', 'bold'],
  warn: ['yellow', 'bold'],
  error: ['red', 'bold'],
};

const kindStream = (kind: Kind): Stream =>
  kind === 'warn' || kind === 'error' ? process.stderr : state.out;

/** `i  scope: message`; the lines after the first are indented under it. */
export function line(kind: Kind, message: string, scope?: string): string {
  const stream = kindStream(kind);
  const symbol = paint(SYMBOLS[kind], KIND_STYLE[kind], stream);
  const label = scope ? `${paint(`${scope}:`, KIND_STYLE[kind], stream)} ` : '';
  const [first, ...rest] = String(message).split('\n');
  return [`${symbol}  ${label}${first}`, ...rest.map((l) => `   ${l}`)].join(
    '\n',
  );
}

/** "0.4s", "12s", "1m 05s" */
export function elapsed(ms: number): string {
  if (ms < 10_000) return `${(ms / 1000).toFixed(1)}s`;
  const s = Math.round(ms / 1000);
  return s < 60
    ? `${s}s`
    : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}

/** "31 KB", "4.2 MB" */
export function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const dim = (text: string, stream: Stream = state.out) =>
  paint(text, ['dim'], stream);

export interface Spinner {
  update(text: string): void;
  stop(): void;
}

/** A step in progress: a spinner on a terminal, else one "label..." line. */
function spin(text: string, scope?: string): Spinner {
  const label = scope ? `${paint(`${scope}:`, ['cyan', 'bold'])} ` : '';
  if (!interactive(state.out) || state.spinner) {
    write(state.out, line('info', `${text}...`, scope));
    return { update: () => undefined, stop: () => undefined };
  }
  const spinner = {
    text: `${label}${text}...`,
    frame: 0,
    sub: interval(80).subscribe(() => {
      spinner.frame++;
      drawSpinner();
    }),
  };
  state.spinner = spinner;
  drawSpinner();
  let stopped = false;
  return {
    update: (next) => {
      spinner.text = `${label}${next}`;
      drawSpinner();
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      spinner.sub.unsubscribe();
      clearSpinnerLine();
      state.spinner = null;
    },
  };
}

const cell = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.map(cell).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const MAX_CELL = 60;
/** long cells are cut - never a URL, people copy those */
const clip = (text: string) =>
  text.length > MAX_CELL && !/^https?:\/\//.test(text)
    ? `${text.slice(0, MAX_CELL - 1)}…`
    : text;

/** console.table's inputs -> rows + columns (an object = key/value rows). */
export function tableRows(
  data: unknown,
  columns?: string[],
): { columns: string[]; rows: string[][] } {
  const list: Record<string, unknown>[] = Array.isArray(data)
    ? data.map((r) => (r && typeof r === 'object' ? r : { value: r }))
    : data && typeof data === 'object'
      ? Object.entries(data).map(([key, value]) =>
          value && typeof value === 'object' && !Array.isArray(value)
            ? { key, ...(value as object) }
            : { key, value },
        )
      : [];
  const cols = columns?.length
    ? columns
    : [...new Set(list.flatMap((r) => Object.keys(r)))];
  return {
    columns: cols,
    rows: list.map((r) => cols.map((c) => clip(cell(r[c])))),
  };
}

export const ui = {
  info: (message: string, scope?: string) =>
    write(state.out, line('info', message, scope)),
  success: (message: string, scope?: string) =>
    write(state.out, line('success', message, scope)),
  warn: (message: string, scope?: string) =>
    write(process.stderr, line('warn', message, scope)),
  error: (message: string, scope?: string) =>
    write(process.stderr, line('error', message, scope)),

  /** plain text, no symbol (data, logs, help) */
  print: (text: string) => write(state.out, text),
  /** secondary text */
  dim,
  bold: (text: string) => paint(text, ['bold']),
  cyan: (text: string) => paint(text, ['cyan']),

  /** `=== Deploying api to project shop`, with a blank line around it */
  header: (text: string) =>
    write(state.out, `\n${paint(`=== ${text}`, ['bold'])}\n\n`),

  /** the closing `✔  Deploy complete!` */
  done: (text: string) =>
    write(
      state.out,
      `\n${paint(SYMBOLS.success, KIND_STYLE.success)}  ${paint(text, ['bold', 'underline'])}\n`,
    ),

  /** `Label:  value` lines, labels bold and aligned */
  summary: (rows: [string, string | null | undefined][]) => {
    const shown = rows.filter(([, v]) => v);
    const width = Math.max(0, ...shown.map(([k]) => k.length + 1));
    shown.forEach(([k, v]) =>
      write(state.out, `${paint(`${k}:`.padEnd(width), ['bold'])}  ${v}`),
    );
  },

  /** aligned columns, dim upper-case header, no borders (kubectl style) */
  table: (data: unknown, columns?: string[]) => {
    const { columns: cols, rows } = tableRows(data, columns);
    if (!rows.length) {
      write(state.out, dim('No results'));
      return;
    }
    const widths = cols.map((c, i) =>
      Math.max(c.length, ...rows.map((r) => visibleLength(r[i]))),
    );
    const render = (cells: string[]) =>
      cells
        .map((c, i) =>
          i === cells.length - 1
            ? c
            : c + ' '.repeat(widths[i] - visibleLength(c)),
        )
        .join('   ')
        .trimEnd();
    write(state.out, dim(render(cols.map((c) => c.toUpperCase()))));
    rows.forEach((r) => write(state.out, render(r)));
  },

  spin,

  /** `?  question [y/N]` - yes only on y / yes. Not on a terminal: an error
      that names the flag to pass instead (CI must never wait for input). */
  confirm: (question: string, flag = '--yes'): Observable<boolean> =>
    !process.stdin.isTTY
      ? throwError(
          () =>
            new Error(
              `${question} - no terminal to ask on; pass ${flag} to go ahead`,
            ),
        )
      : new Observable<boolean>((subscriber) => {
          const rl = createInterface({
            input: process.stdin,
            output: state.out,
          });
          rl.question(
            `${paint('?', ['cyan', 'bold'])}  ${question} ${dim('[y/N]')} `,
            (answer) => {
              rl.close();
              subscriber.next(/^y(es)?$/i.test(answer.trim()));
              subscriber.complete();
            },
          );
          return () => rl.close();
        }),
};

/**
 * One step of a flow, as an operator: `i  scope: label...` (a spinner on a
 * terminal) while it runs, `✔  scope: <done text> 1.2s` when it completes,
 * `✖  scope: label failed` when it errors (the error goes on to the caller).
 */
export function step<T>(
  label: string,
  opts: { scope?: string; done?: (value: T) => string } = {},
): MonoTypeOperatorFunction<T> {
  return (source) =>
    defer(() => {
      const started = Date.now();
      const spinner = spin(label, opts.scope);
      // the done line comes when the step COMPLETES, before anything
      // downstream sees its value - so it is printed before the next step
      return source.pipe(
        toArray(),
        tap({
          next: (values) => {
            spinner.stop();
            const value = values[values.length - 1];
            const text = opts.done ? opts.done(value) : label;
            ui.success(
              `${text} ${dim(elapsed(Date.now() - started))}`,
              opts.scope,
            );
          },
          error: () => {
            spinner.stop();
            ui.error(`${label} failed`, opts.scope);
          },
        }),
        switchMap((values) => from(values)),
        finalize(() => spinner.stop()),
      );
    });
}

/** Text of anything thrown: Error, GraphQL error list, string, object. */
export function errorText(error: unknown): string {
  if (error instanceof Error) {
    return env.GCLI_DEBUG && error.stack ? error.stack : error.message;
  }
  if (Array.isArray(error)) return error.map(errorText).join('\n');
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return typeof error === 'string' ? error : format(error);
}

/** JSON text is data: printed as is, so `| jq` keeps working. */
export const looksLikeJson = (text: string) => {
  const t = text.trim();
  if (!/^[[{]/.test(t)) return false;
  try {
    JSON.parse(t);
    return true;
  } catch {
    return false;
  }
};

export const formatArgs = (data: any[]) => format(...data);
