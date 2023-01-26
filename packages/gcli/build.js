const dotenvLoad = require('dotenv-load');
dotenvLoad(process.env.NODE_ENV);

require('esbuild')
  .build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node14.4',
    outfile: './release/index.js',
    define: {
      'process.env.MONGODB_URI': `'${process.env.MONGODB_URI}'`,
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
      'process.env.PORT': `9000`,
    },
  })
  .then((data) => console.log('SUCCESS', data))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
