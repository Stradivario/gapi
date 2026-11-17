import { concat, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap, tap, toArray } from 'rxjs/operators';

import { loadSpec } from '~/commands/lambda/helpers/load-spec';
import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { queuesToDeclare, resolveBroker } from './resolve-broker';

export interface DeclareQueueFlags {
  project?: string;
  name?: string[];
  broker?: string;
  spec?: string;
}

/**
 * Declares queues on a broker of the project. Names come from --name
 * (repeatable) or from `queues.declare` in lambforge.yaml. Safe to run
 * again: a queue the broker already has is skipped.
 */
export default (cmd: DeclareQueueFlags) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        (cmd.name?.length
          ? of({ names: cmd.name, broker: cmd.broker })
          : loadSpec(cmd.spec).pipe(
              map((data) => ({
                names: data?.queues?.declare ?? [],
                broker: cmd.broker ?? data?.queues?.broker,
              })),
              catchError(() =>
                of({ names: [] as string[], broker: cmd.broker }),
              ),
            )
        ).pipe(
          switchMap(({ names, broker }) => {
            if (!names.length) {
              throw new Error(
                'queue:declare needs --name (repeatable) or queues.declare in lambforge.yaml',
              );
            }
            return GraphqlClienAPI.listRabbitMqInstances(projectId).pipe(
              map((brokers) => resolveBroker(brokers, broker)),
              switchMap((target) => {
                const missing = queuesToDeclare(target, names);
                const skipped = names.filter((n) => !missing.includes(n));
                return concat(
                  ...missing.map((name) =>
                    GraphqlClienAPI.declareQueue(target.id, projectId, {
                      name,
                      durable: true,
                      auto_delete: false,
                    }),
                  ),
                ).pipe(
                  toArray(),
                  map(() => ({ broker: target.name, missing, skipped })),
                );
              }),
            );
          }),
        ),
      ),
      tap(({ broker, missing, skipped }) => {
        Logger.log('-------------------');
        Logger.log('[Action][declareQueue]');
        Logger.table([
          ...missing.map((name) => ({
            broker,
            queue: name,
            result: 'declared',
          })),
          ...[...new Set(skipped)].map((name) => ({
            broker,
            queue: name,
            result: 'exists',
          })),
        ]);
        Logger.log('-------------------');
      }),
    ),
  );
