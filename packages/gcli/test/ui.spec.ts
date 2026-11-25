import { lastValueFrom, of, throwError } from 'rxjs';

import {
  bytes,
  colorEnabled,
  elapsed,
  errorText,
  line,
  looksLikeJson,
  step,
  tableRows,
  ui,
} from '../src/services/ui';

/** Feature cli-output. Output is captured from the real streams; jest is
    not a terminal, so no colour and no spinner - the CI view. */
const capture = () => {
  const out: string[] = [];
  const spies = [
    jest.spyOn(process.stdout, 'write').mockImplementation((t) => {
      out.push(String(t));
      return true;
    }),
    jest.spyOn(process.stderr, 'write').mockImplementation((t) => {
      out.push(String(t));
      return true;
    }),
  ];
  return {
    text: () => out.join(''),
    restore: () => spies.forEach((s) => s.mockRestore()),
  };
};

describe('cli-output ui', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });

  it('colour: FORCE_COLOR wins, NO_COLOR and a pipe turn it off', () => {
    const tty = { isTTY: true } as NodeJS.WriteStream;
    const pipe = { isTTY: false } as NodeJS.WriteStream;
    delete process.env.FORCE_COLOR;
    delete process.env.NO_COLOR;
    process.env.TERM = 'xterm-256color';
    expect(colorEnabled(tty)).toBe(true);
    expect(colorEnabled(pipe)).toBe(false);
    process.env.NO_COLOR = '1';
    expect(colorEnabled(tty)).toBe(false);
    process.env.FORCE_COLOR = '1';
    expect(colorEnabled(pipe)).toBe(true);
    process.env.FORCE_COLOR = '0';
    expect(colorEnabled(tty)).toBe(false);
  });

  it('a line: symbol, scope, message; later lines indented', () => {
    expect(line('success', 'archive uploaded', 'lambda[api]')).toBe(
      '✔  lambda[api]: archive uploaded',
    );
    expect(line('error', 'failed\ndetail')).toBe('✖  failed\n   detail');
  });

  it('times and sizes in plain words', () => {
    expect(elapsed(400)).toBe('0.4s');
    expect(elapsed(12_000)).toBe('12s');
    expect(elapsed(65_000)).toBe('1m 05s');
    expect(bytes(512)).toBe('512 B');
    expect(bytes(31_744)).toBe('31 KB');
    expect(bytes(4_404_019)).toBe('4.2 MB');
  });

  it('tables take what console.table took', () => {
    expect(
      tableRows(
        [{ name: 'api', url: null, tags: ['a', 'b'] }],
        ['name', 'url', 'tags'],
      ),
    ).toEqual({
      columns: ['name', 'url', 'tags'],
      rows: [['api', '-', 'a, b']],
    });
    expect(tableRows({ a: 1 })).toEqual({
      columns: ['key', 'value'],
      rows: [['a', '1']],
    });
    expect(tableRows([{ long: 'x'.repeat(80) }]).rows[0][0]).toHaveLength(60);
    const url = `https://functions.lambforge.com/${'x'.repeat(80)}`;
    expect(tableRows([{ url }]).rows[0][0]).toBe(url);
  });

  it('prints an aligned table with an upper-case header', () => {
    const c = capture();
    ui.table([
      { name: 'lambforge-app', env: 'static-hosting' },
      { name: 'gateway', env: 'nodejs' },
    ]);
    c.restore();
    expect(c.text()).toBe(
      'NAME            ENV\nlambforge-app   static-hosting\ngateway         nodejs\n',
    );
  });

  it('step: a start line, then done with the time; an error says failed', async () => {
    const c = capture();
    await lastValueFrom(
      of(3).pipe(
        step('packing', { scope: 's', done: (n) => `packed ${n} files` }),
      ),
    );
    await lastValueFrom(
      throwError(() => new Error('x')).pipe(step('uploading', { scope: 's' })),
    ).catch(() => undefined);
    c.restore();
    expect(c.text()).toMatch(
      /^i {2}s: packing\.\.\.\n✔ {2}s: packed 3 files \d\.\ds\ni {2}s: uploading\.\.\.\n✖ {2}s: uploading failed\n$/,
    );
  });

  it('JSON stays data; errors of any shape become text', () => {
    expect(looksLikeJson('{"a":1}')).toBe(true);
    expect(looksLikeJson('{ not json')).toBe(false);
    expect(errorText(new Error('boom'))).toBe('boom');
    expect(errorText([{ message: 'a' }, 'b'])).toBe('a\nb');
    expect(errorText('missing-lambda')).toBe('missing-lambda');
  });
});
