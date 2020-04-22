/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  //   GenericGapiResolversType,
  Injectable,
  InterceptResolver,
} from '@gapi/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// import { ILinkListType } from '../../../daemon-server/api-introspection';
// import notifier = require('node-notifier');

@Injectable()
export class NotifyInterceptor implements InterceptResolver {
  intercept(
    chainable$: Observable<any>
    // context,
    // payload: ILinkListType,
    // descriptor: GenericGapiResolversType
  ) {
    console.log('Before...');
    // const options = { timeout: 2 };
    // notifier.notify({
    //     'title': `Daemon triggered!`,
    //     'message': `${payload.repoPath}`,
    //     ...options
    // });
    const now = Date.now();
    return chainable$.pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`))
      // tap(() => notifier.notify({
      //     'title': 'Daemon finished!',
      //     'message': `Request took ${Date.now() - now}ms`,
      //     ...options
      // }))
    );
  }
}
