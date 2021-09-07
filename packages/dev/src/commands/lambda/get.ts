import { switchMap, tap } from 'rxjs/operators';

import { isMongoId } from '~/helpers';
import { GraphqlClienAPI } from '~/services/gql-client';

export default (...[lambdaId]) =>
  isMongoId(lambdaId)
    .pipe(
      switchMap((id) => GraphqlClienAPI.getLambda(id).toPromise()),
      tap((data) => {
        const columns: (keyof typeof data)[] = [
          'name',
          'projectId',
          'url',
          'method',
        ];
        console.log('-------------------');
        console.log('[Action][getLambda]');
        console.table([data], columns);
        console.log('-------------------');
      }),
    )
    .toPromise();
