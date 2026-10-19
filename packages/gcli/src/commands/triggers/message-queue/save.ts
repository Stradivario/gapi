import { lastValueFrom, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import {
  GraphqlClienAPI,
  MessageQueueTrigger,
  MessageQueueTriggerInput,
} from '~/services/gql-client';
import { Logger } from '~/services/log';

export interface MqTriggerFlags {
  project?: string;
  name: string;
  lambda?: string;
  requestTopic?: string;
  responseTopic?: string;
  errorTopic?: string;
  broker?: string;
  maxRetries?: string;
  coolDownPeriod?: string;
  pollingInterval?: string;
  minReplicas?: string;
  maxReplicas?: string;
  threshold?: string;
}

const int = (value: string | undefined, flag: string) => {
  if (value === undefined) {
    return undefined;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`--${flag} must be a whole number, got "${value}"`);
  }
  return n;
};

/** Flags → MessageQueueTriggerInput; unset flags are left out (update keeps them). */
export const toTriggerInput = (
  mode: 'create' | 'update',
  cmd: MqTriggerFlags,
): MessageQueueTriggerInput => {
  if (mode === 'create' && (!cmd.lambda || !cmd.requestTopic)) {
    throw new Error('mq-trigger:create needs --lambda and --request-topic');
  }
  const input: MessageQueueTriggerInput = {
    name: cmd.name,
    lambdaName: cmd.lambda,
    requestTopic: cmd.requestTopic,
    responseTopic: cmd.responseTopic,
    errorTopic: cmd.errorTopic,
    rabbitMqId: cmd.broker,
    maxRetries: int(cmd.maxRetries, 'max-retries'),
    coolDownPeriod: int(cmd.coolDownPeriod, 'cool-down-period'),
    pollingInterval: int(cmd.pollingInterval, 'polling-interval'),
    minReplicaCount: int(cmd.minReplicas, 'min-replicas'),
    maxReplicaCount: int(cmd.maxReplicas, 'max-replicas'),
    threshold: int(cmd.threshold, 'threshold'),
  };
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined),
  ) as unknown as MessageQueueTriggerInput;
};

/**
 * The service hands an update's payload to Fission as the whole trigger
 * spec and picks the cluster by `lambdaName` - so an update sends the
 * current trigger with the given flags on top, never a partial payload.
 */
export const mergeOverExisting = (
  existing: MessageQueueTrigger | undefined,
  changes: MessageQueueTriggerInput,
): MessageQueueTriggerInput => {
  if (!existing) {
    throw new Error(
      `mq-trigger-not-found: no trigger named "${changes.name}" (see mq-trigger:list)`,
    );
  }
  const current: MessageQueueTriggerInput = {
    name: existing.name,
    lambdaName: existing.lambdaName,
    requestTopic: existing.requestTopic,
    responseTopic: existing.responseTopic ?? undefined,
    errorTopic: existing.errorTopic ?? undefined,
    rabbitMqId: existing.rabbitMqId ?? undefined,
    maxRetries: existing.maxRetries ?? undefined,
    coolDownPeriod: existing.coolDownPeriod ?? undefined,
    pollingInterval: existing.pollingInterval ?? undefined,
    minReplicaCount: existing.minReplicaCount ?? undefined,
    maxReplicaCount: existing.maxReplicaCount ?? undefined,
    threshold: existing.threshold ?? undefined,
  };
  return Object.fromEntries(
    Object.entries({ ...current, ...changes }).filter(
      ([, v]) => v !== undefined,
    ),
  ) as unknown as MessageQueueTriggerInput;
};

export default (mode: 'create' | 'update', cmd: MqTriggerFlags) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) => {
        const changes = toTriggerInput(mode, cmd);
        const payload$ =
          mode === 'create'
            ? of(changes)
            : GraphqlClienAPI.listMessageQueueTriggers(projectId).pipe(
                map((triggers) =>
                  mergeOverExisting(
                    triggers.find((t) => t.name === cmd.name),
                    changes,
                  ),
                ),
              );
        return payload$.pipe(
          switchMap((payload) =>
            GraphqlClienAPI.saveMessageQueueTrigger(mode, projectId, payload),
          ),
        );
      }),
      tap((trigger) => {
        Logger.log('-------------------');
        Logger.log(`[Action][${mode}MessageQueueTrigger]`);
        Logger.table([
          {
            name: trigger.name,
            lambda: trigger.lambdaName,
            requestTopic: trigger.requestTopic,
            responseTopic: trigger.responseTopic ?? '',
            errorTopic: trigger.errorTopic ?? '',
          },
        ]);
        Logger.log('-------------------');
      }),
    ),
  );
