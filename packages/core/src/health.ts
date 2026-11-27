/**
 * Health checks for a @gapi/core app on Lambforge (any runtime image
 * >= rxdi/fission-nodejs-graphql 0.0.98 asks them; elsewhere they are
 * registered and never asked).
 *
 *   @Module({
 *     imports: [
 *       HealthModule.forRoot([
 *         // readiness: while it fails the pod gets no new requests
 *         { name: 'redis', deps: [RedisService], check: (redis) => redis.ping() },
 *         // liveness: failing 60 s restarts the container
 *         {
 *           name: 'nats',
 *           liveness: true,
 *           deps: [NatsClientService],
 *           check: (nats) => nats.getClient()?.flush(),
 *         },
 *       ]),
 *     ],
 *   })
 *
 * Each check becomes a lazy factory provider: Bootstrap() resolves its deps
 * (the same instances the app uses) and registers it in the process-wide
 * registry of @lambforge/runtime, which the runtime answers
 * /__lambforge/ready and /__lambforge/live from.
 */
import { registerHealthCheck } from '@lambforge/runtime';
import { InjectionToken, Module, ModuleWithServices } from '@rxdi/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dep = any;

export interface GapiHealthCheck<D extends Dep[] = Dep[]> {
  name: string;
  /** injected into `check`, in this order */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps?: { [K in keyof D]: any };
  /** throws / rejects / errors (an Observable) when unhealthy */
  check: (...deps: D) => unknown;
  /** also restart the container when it keeps failing (default false) */
  liveness?: boolean;
  /** ms, default 2000 */
  timeout?: number;
}

@Module()
export class HealthModule {
  public static forRoot(checks: GapiHealthCheck[]): ModuleWithServices {
    return {
      module: HealthModule,
      // a fresh provider object per call: @rxdi/core rewrites what it registers
      providers: checks.map(
        ({ name, deps = [], check, liveness, timeout }) => ({
          provide: new InjectionToken<boolean>(`gapi-health-check:${name}`),
          lazy: true,
          deps,
          useFactory: async (...resolved: Dep[]) => {
            registerHealthCheck({
              name,
              liveness,
              timeout,
              check: () => check(...resolved),
            });
            return true;
          },
        }),
      ),
    };
  }
}
