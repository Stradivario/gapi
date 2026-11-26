import type { Plugin } from 'esbuild';
import { relative, resolve, sep } from 'path';
import { defer, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * `options.bundler.isolated: true` (feature repo-plan / monorepo services):
 * the bundle takes packages only from the package's OWN node_modules.
 *
 * A service with its own package-lock.json inside a monorepo (e.g.
 * services/graphql-server next to a yarn workspace) would otherwise also
 * find packages in the repo-root node_modules by walking up the folders:
 * optional requires the service never installed (gaxios, encoding, ...)
 * got bundled - 94 extra files, a different bundle than the service built
 * as its own repository (2026-11-25). Such a package stays an external
 * runtime require, exactly as before.
 */
export const isolatedPlugin = (root: string): Plugin => ({
  name: 'gcli-isolated',
  setup(build) {
    const own = resolve(root);
    build.onResolve({ filter: /^[^./]/ }, (args) => {
      // the second resolve below comes back here: let esbuild do it
      if (args.pluginData?.gcliIsolated) return undefined;
      // esbuild wants a Promise here (the boundary)
      return lastValueFrom(
        defer(() =>
          build.resolve(args.path, {
            resolveDir: args.resolveDir,
            kind: args.kind,
            importer: args.importer,
            pluginData: { gcliIsolated: true },
          }),
        ).pipe(
          // only "found above the package" changes; everything else goes
          // back to esbuild's own resolution (and its leniency for an
          // optional require inside try / catch)
          map((result) =>
            !result.errors.length && isOutside(own, result.path)
              ? { path: args.path, external: true }
              : undefined,
          ),
        ),
      );
    });
  },
});

/** A resolved file outside the package (`../` from its root). Built-in
    modules and externals have no path or a non-absolute one. */
export const isOutside = (root: string, file: string) => {
  if (!file || !file.startsWith(sep)) return false;
  const rel = relative(root, file);
  return rel.startsWith('..');
};
