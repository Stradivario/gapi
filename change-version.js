/* eslint-disable @typescript-eslint/no-var-requires */
const { readFile, readdir, writeFile } = require('fs');
const { promisify } = require('util');
async function readPackageJson(dir) {
  return JSON.parse(await promisify(readFile)(dir, { encoding: 'utf-8' }));
}
async function main() {
  const { version } = await readPackageJson('package.json');
  const dirs = await promisify(readdir)('packages');
  const packagesJsons = await Promise.all(
    dirs.map(async (directory) => {
      const path = `./packages/${directory}/package.json`;
      const file = await readPackageJson(path);
      return {
        file,
        path,
      };
    })
  );
  const privatePackages = packagesJsons.map((json) => json.file.name);
  const modified = packagesJsons.map((json) => {
    json.file.dependencies = Object.entries(
      json.file.dependencies || []
    ).reduce((prev, [k]) => {
      if (privatePackages.includes(k)) {
        prev[k] = `^${version}`;
      }
      return prev;
    }, json.file.dependencies);
    return json;
  });
  await Promise.all(
    modified.map(({ file, path }) =>
      promisify(writeFile)(path, JSON.stringify(file, null, 2), {
        encoding: 'utf-8',
      })
    )
  );
  console.log(modified);
}

main();
