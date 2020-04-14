import { Injectable, CanActivateResolver, GenericGapiResolversType } from '@gapi/core';
import { Observable } from 'rxjs';

@Injectable()
export class <%= classify(name) %>Guard implements CanActivateResolver {
    canActivate(
        context,
        payload,
        descriptor: GenericGapiResolversType
    ): boolean | Promise<boolean> | Observable<boolean> {
        return new Observable(o => o.next(true));
        return new Promise((r) => r(true));
        return new Observable(o => o.next(false));
        return new Promise((r) => r(false));
        throw new Error('error');
    }
}
