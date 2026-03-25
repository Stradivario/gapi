require('esbuild')
  .build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node24',
    outfile: './release/index.js',
    external: ["esbuild-wasm"]
  })
  .then((data) => console.log('SUCCESS', data))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
