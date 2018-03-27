const { writeFileSync } = require('fs');
const { join } = require('path');
const { lstatSync, readdirSync, readFileSync } = require('fs');

const package = require('./package.json');
let buildVersion = package.version;

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source => readdirSync(source).map(name => join(source, name)).filter(isDirectory);
const repos = [];

getDirectories(__dirname)
.forEach(dir => {
  if (dir.includes('.git')) {
    return;
  }
  repos.push({
    name: JSON.parse(readFileSync(dir + '/package.json', 'utf8')).name,
    directory: dir
  });
})

function changeVersion(packages) {
  if (packages) {
    for(let dep in packages) {
      repos.forEach(repo => {
        if(dep === repo.name) {
          if (dep === repo.name) {
            console.log(packages, repo.name, dep);
            packages[repo.name] = '^' + buildVersion;
          }
        }
      })
    }
  }
}

repos
.forEach(r => {
  const rawFile = readFileSync(r.directory + '/package.json', 'utf8');
  const package = JSON.parse(rawFile);
  changeVersion(package.dependencies);
  changeVersion(package.devDependencies);
  changeVersion(package.peerDependencies);
  writeFileSync(r.directory + '/package.json', JSON.stringify(package, null, 2), 'utf8');
});

