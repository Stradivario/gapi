require('esbuild')
  .build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node24',
    outfile: './release/index.js',
    // `gcli --version` reads it (src/main.ts)
    define: {
      __GCLI_VERSION__: JSON.stringify(require('./package.json').version),
    },
    external: process.env.BINARY_BUILD ? [] : ["esbuild"]
  })
  .then((data) => console.log('SUCCESS', data))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
