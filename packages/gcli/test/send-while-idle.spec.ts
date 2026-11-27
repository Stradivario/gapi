import { Observable, Subject } from 'rxjs';

import { sendWhileIdle } from '../src/commands/workspace/send-while-idle';

describe('terminal output: sent at once when idle, batched while busy', () => {
  it('first value goes alone; values during a send join the next; order kept', () => {
    const sends: string[][] = [];
    const done: Array<() => void> = [];
    const send = (batch: string[]) =>
      new Observable<void>((sub) => {
        sends.push(batch);
        done.push(() => sub.complete());
      });
    const in$ = new Subject<string>();
    in$.pipe(sendWhileIdle(send)).subscribe();

    in$.next('a'); // idle: out at once
    expect(sends).toEqual([['a']]);
    in$.next('b');
    in$.next('c'); // busy: waiting
    expect(sends).toEqual([['a']]);
    done.shift()!(); // 'a' accepted -> b + c together
    expect(sends).toEqual([['a'], ['b', 'c']]);
    done.shift()!();
    in$.next('d'); // idle again: at once
    expect(sends).toEqual([['a'], ['b', 'c'], ['d']]);
  });

  it('a failed send does not stop the next ones', () => {
    const sends: string[][] = [];
    const in$ = new Subject<string>();
    in$
      .pipe(
        sendWhileIdle(
          (batch: string[]) =>
            new Observable<void>((sub) => {
              sends.push(batch);
              sub.error(new Error('offline'));
            }),
        ),
      )
      .subscribe();
    in$.next('x');
    in$.next('y');
    expect(sends).toEqual([['x'], ['y']]);
  });
});
