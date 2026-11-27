import { concat, defer, EMPTY, Observable } from 'rxjs';
import { catchError, exhaustMap, ignoreElements, tap } from 'rxjs/operators';

/**
 * Sends values in order, one send at a time, with NO timer: a value that
 * arrives while nothing is in flight goes out at once (a keystroke's echo
 * is not held back), values that arrive while a send is on its way join
 * the next send. Fast output just makes bigger sends. The same pattern the
 * browser uses for keystrokes (gql-fission workspace-tunnel.runtime.ts).
 * A failed send is dropped (terminal output is best effort), the next one
 * still goes.
 */
export function sendWhileIdle<T>(send: (batch: T[]) => Observable<unknown>) {
  return (source$: Observable<T>): Observable<never> =>
    defer(() => {
      let pending: T[] = [];
      const sendPending = (): Observable<never> =>
        defer(() => {
          if (!pending.length) return EMPTY;
          const batch = pending;
          pending = [];
          return concat(
            send(batch).pipe(
              catchError(() => EMPTY),
              ignoreElements(),
            ),
            sendPending(),
          );
        });
      return source$.pipe(
        tap((value) => pending.push(value)),
        exhaustMap(() => sendPending()),
      );
    });
}
