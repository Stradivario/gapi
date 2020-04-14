import { Injectable } from '@gapi/core';
import { tap } from 'rxjs/operators';

@Injectable()
export class <%= classify(name) %>Interceptor {
    intercept(
        chainable$,
        context,
        payload,
        descriptor
    ) {
        console.log('Before...');
        const now = Date.now();
        return chainable$.pipe(
            tap(() => console.log(`After... ${Date.now() - now}ms`)),
        );
    }
}
