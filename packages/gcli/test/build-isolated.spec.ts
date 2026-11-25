import { isOutside } from '~/commands/build/isolated';

/** Feature repo-plan: `options.bundler.isolated` - a service inside a
    monorepo bundles only from its own node_modules. */
describe('isOutside', () => {
  const root = '/repo/services/api';

  it('its own files and node_modules are inside', () => {
    expect(
      isOutside(root, '/repo/services/api/node_modules/rxjs/index.js'),
    ).toBe(false);
    expect(isOutside(root, '/repo/services/api/src/main.ts')).toBe(false);
  });

  it('the repo-root node_modules is outside', () => {
    expect(isOutside(root, '/repo/node_modules/gaxios/build/index.js')).toBe(
      true,
    );
  });

  it('built-ins and externals have no absolute path', () => {
    expect(isOutside(root, '')).toBe(false);
    expect(isOutside(root, 'fs')).toBe(false);
  });
});
