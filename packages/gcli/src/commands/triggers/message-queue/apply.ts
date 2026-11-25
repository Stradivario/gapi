import { concat, lastValueFrom } from 'rxjs';
import { map, switchMap, tap, toArray } from 'rxjs/operators';

import { loadSpec, MqTriggerConfig } from '~/commands/lambda/helpers/load-spec';
import { resolveBroker } from '~/commands/rabbitmq/resolve-broker';
import { parseProjectId } from '~/helpers';
import {
  GraphqlClienAPI,
  MessageQueueTrigger,
  MessageQueueTriggerInput,
} from '~/services/gql-client';
import { Logger } from '~/services/log';

import { mergeOverExisting } from './save';

/** A `triggers.mq` entry of lambforge.yaml as the API input; `lambda`
    defaults to the file's own function, `broker` is resolved to its id. */
export const yamlTriggerInput = (
  trigger: MqTriggerConfig,
  defaults: { lambda?: string; brokerId?: string },
): MessageQueueTriggerInput => {
  if (!trigger?.name || !trigger.requestTopic) {
    throw new Error('triggers.mq: every entry needs `name` and `requestTopic`');
  }
  const lambdaName = trigger.lambda ?? defaults.lambda;
  if (!lambdaName) {
    throw new Error(
      `triggers.mq "${trigger.name}": no lambda - set \`lambda\` or \`function.name\``,
    );
  }
  const input: MessageQueueTriggerInput = {
    name: trigger.name,
    lambdaName,
    requestTopic: trigger.requestTopic,
    responseTopic: trigger.responseTopic,
    errorTopic: trigger.errorTopic,
    rabbitMqId: defaults.brokerId,
    maxRetries: trigger.maxRetries,
    coolDownPeriod: trigger.coolDownPeriod,
    pollingInterval: trigger.pollingInterval,
    minReplicaCount: trigger.minReplicas,
    maxReplicaCount: trigger.maxReplicas,
    threshold: trigger.threshold,
  };
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined),
  ) as unknown as MessageQueueTriggerInput;
};

/** create when the project has no trigger of that name, else update. */
export const applyMode = (
  existing: MessageQueueTrigger[],
  name: string,
): 'create' | 'update' =>
  existing.some((t) => t.name === name) ? 'update' : 'create';

/** Creates the missing `triggers.mq` of a spec, updates the others (never
    deletes). Shared by mq-trigger:apply and gcli apply. */
export const applyMqTriggers = (
  projectId: string,
  data: {
    function?: { name?: string };
    name?: string;
    triggers?: { mq?: MqTriggerConfig[] };
    queues?: { broker?: string };
  },
) => {
  const triggers = data?.triggers?.mq ?? [];
  return GraphqlClienAPI.listRabbitMqInstances(projectId).pipe(
    switchMap((brokers) =>
      GraphqlClienAPI.listMessageQueueTriggers(projectId).pipe(
        switchMap((existing) =>
          concat(
            ...triggers.map((trigger) => {
              const input = yamlTriggerInput(trigger, {
                lambda: data?.function?.name ?? data?.name,
                brokerId: resolveBroker(
                  brokers,
                  trigger.broker ?? data?.queues?.broker,
                ).id,
              });
              const mode = applyMode(existing ?? [], input.name);
              return GraphqlClienAPI.saveMessageQueueTrigger(
                mode,
                projectId,
                mode === 'create'
                  ? input
                  : mergeOverExisting(
                      existing.find((t) => t.name === input.name),
                      input,
                    ),
              ).pipe(map((saved) => ({ mode, saved })));
            }),
          ).pipe(toArray()),
        ),
      ),
    ),
  );
};

/**
 * Brings the project's message-queue triggers to what `triggers.mq` in
 * lambforge.yaml says: creates the missing ones, updates the others. Safe to
 * run on every deploy. It never deletes a trigger (mq-trigger:delete).
 */
export default (cmd: { project?: string; spec?: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        loadSpec(cmd.spec).pipe(
          switchMap((data) => {
            if (!data?.triggers?.mq?.length) {
              throw new Error(
                'mq-trigger:apply needs triggers.mq in lambforge.yaml',
              );
            }
            return applyMqTriggers(projectId, data as never);
          }),
        ),
      ),
      tap((results) => {
        Logger.table(
          results.map(({ mode, saved }) => ({
            name: saved.name,
            lambda: saved.lambdaName,
            requestTopic: saved.requestTopic,
            responseTopic: saved.responseTopic ?? '',
            errorTopic: saved.errorTopic ?? '',
            result: mode === 'create' ? 'created' : 'updated',
          })),
        );
      }),
    ),
  );
