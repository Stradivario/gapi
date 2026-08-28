import { lastValueFrom, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { parseProjectId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';
import { Logger } from '~/services/log';

import { writeFileAsObservable } from '../lambda/helpers/read-file';

export default (cmd: { project?: string; cluster: string; output?: string }) =>
  lastValueFrom(
    parseProjectId(cmd.project).pipe(
      switchMap((projectId) =>
        GraphqlClienAPI.clusterKubeconfig(projectId, cmd.cluster),
      ),
      switchMap((kubeconfig) =>
        cmd.output
          ? writeFileAsObservable(cmd.output, kubeconfig).pipe(
              tap(() => Logger.info(`Wrote kubeconfig to ${cmd.output}`)),
            )
          : of(kubeconfig).pipe(tap((value) => Logger.log(value))),
      ),
    ),
  );
