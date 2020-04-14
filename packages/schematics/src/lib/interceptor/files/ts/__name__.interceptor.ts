import { InterceptResolver, Injectable, GenericGapiResolversType } from '@gapi/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class <%= classify(name) %>Interceptor implements InterceptResolver {
    intercept(
        chainable$: Observable<any>,
        context,
        payload,
        descriptor: GenericGapiResolversType
    ) {
        console.log('Before...');
        const now = Date.now();
        return chainable$.pipe(
            tap(() => console.log(`After... ${Date.now() - now}ms`)),
        );
    }
}