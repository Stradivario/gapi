/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {
  Bootstrap as RxdiBootstrap,
  ConfigModel,
  Container,
  ObservableContainer,
} from '@rxdi/core';
import { Observable } from 'rxjs';

/**
 * Lambda bridge for Lambforge (or any host that pre-bootstraps a gapi
 * runtime and later wants the user's AppModule applied in-place).
 *
 * In a normal process, `Bootstrap(AppModule)` starts the whole framework.
 * Inside a Lambforge container the framework is already running — the user's
 * AppModule needs to be wired into the live container rather than starting
 * a fresh one. The host (FissionPlugin) calls `awaitLambdaModule()` after
 * loading the user bundle; when the user bundle's `Bootstrap(AppModule)`
 * fires, the env-gated wrapper delivers the module reference here, and the
 * host applies it via `BootstrapService.applyModule`.
 *
 * Activation: set `LAMBFORGE_RUNTIME=1` in the container's process env
 * BEFORE `require()`ing the user bundle. The user's source code is
 * unchanged — `Bootstrap(AppModule).subscribe(...)` works in both modes.
 */

let pendingResolver: ((module: Function) => void) | null = null;
let pendingPromise: Promise<Function> | null = null;
let pendingDelivered: Function | null = null;

export function isLambdaRuntime(): boolean {
  return process.env.LAMBFORGE_RUNTIME === '1';
}

/**
 * Synchronous check: did a user bundle already deliver its AppModule via
 * the bridge? Useful right after `await import(userBundle)` to decide
 * between the new (Bootstrap-based) and legacy (default-export-function)
 * specialize paths without paying a Promise-race timeout.
 */
export function isLambdaModuleDelivered(): boolean {
  return pendingDelivered !== null;
}

/**
 * Called by the host (e.g. FissionPlugin) before loading the user bundle.
 * Returns a Promise that resolves with the user's AppModule once the
 * lambda-aware Bootstrap intercepts it.
 */
export function awaitLambdaModule(): Promise<Function> {
  if (pendingDelivered) {
    return Promise.resolve(pendingDelivered);
  }
  if (pendingPromise) {
    return pendingPromise;
  }
  pendingPromise = new Promise<Function>((resolve) => {
    pendingResolver = resolve;
  });
  return pendingPromise;
}

/**
 * Called by the lambda-aware Bootstrap wrapper to hand the user's AppModule
 * to the waiting host. If the host hasn't called `awaitLambdaModule()` yet,
 * we cache the module so the next caller gets it.
 */
export function deliverLambdaModule(appModule: Function): void {
  if (pendingResolver) {
    pendingResolver(appModule);
    pendingResolver = null;
    pendingPromise = null;
    pendingDelivered = appModule;
    return;
  }
  pendingDelivered = appModule;
  pendingPromise = Promise.resolve(appModule);
}

/**
 * Resets bridge state. Useful for tests and (eventually) re-specialization
 * if a single container ever needs to load more than one user bundle.
 */
export function resetLambdaBridge(): void {
  pendingResolver = null;
  pendingPromise = null;
  pendingDelivered = null;
}

/**
 * Drop-in replacement for `@rxdi/core` Bootstrap that detects Lambforge mode
 * via env. In lambda mode, the AppModule is delivered to the bridge and a
 * dummy observable resolves so user code's `.subscribe(...)` still fires
 * (which lets `console.log('Server started')` style callbacks run as the
 * user expects). In normal mode, this is exactly the upstream Bootstrap.
 */
export function Bootstrap(
  app: Function,
  config?: ConfigModel,
): Observable<ObservableContainer> {
  if (isLambdaRuntime()) {
    deliverLambdaModule(app);
    return new Observable<ObservableContainer>((subscriber) => {
      subscriber.next(Container as ObservableContainer);
      subscriber.complete();
    });
  }
  return RxdiBootstrap(app, config);
}
