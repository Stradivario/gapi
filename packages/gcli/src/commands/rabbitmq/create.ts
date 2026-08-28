import { IRabbitMqStorageSizeEnum } from '@introspection/index';
import { lastValueFrom } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { loadSpec } from '../lambda/helpers/load-spec';

interface RabbitMqYamlSpec {
  name: string;
  description?: string;
  user: string;
  password: string;
  region: string;
  storage?: { enabled: boolean; size?: IRabbitMqStorageSizeEnum };
  clusterId?: string;
}

export default (
  cmd: {
    spec?: string;
    project?: string;
    cluster?: string;
  } & Partial<RabbitMqYamlSpec>,
) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        loadSpec<{ rabbitmq?: RabbitMqYamlSpec } & Partial<RabbitMqYamlSpec>>(
          cmd.spec ?? 'rabbitmq.yaml',
        ).pipe(
          map((data) => ({
            projectId,
            ...(data ? (data.rabbitmq ?? data) : {}),
          })),
        ),
      ),
      switchMap(({ projectId, ...data }) =>
        GraphqlClienAPI.installRabbitMq(projectId, {
          name: cmd.name || data.name,
          description: cmd.description || data.description,
          user: cmd.user || data.user,
          password: cmd.password || data.password,
          region: (cmd.region || data.region) as never,
          storage: data.storage,
          clusterId: cmd.cluster || data.clusterId,
        }),
      ),
      tap((broker) => {
        Logger.log('-------------------');
        Logger.log('[Action][installRabbitMq]');
        Logger.table([broker]);
        Logger.log('-------------------');
      }),
    ),
  );
