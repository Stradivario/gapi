const { writeFileSync } = require("fs");
const { join } = require("path");
const { lstatSync, readdirSync, readFileSync } = require("fs");

const package = require("./package.json");
let buildVersion = package.version;

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory);
const repos = [];
let count = 0;

getDirectories(__dirname).forEach(dir => {
  if (dir.includes(".git")) {
    return;
  }
  const packageJson = JSON.parse(readFileSync(dir + "/package.json", "utf8"));

  if (packageJson.repository) {
    count++;
    repos.push({
      id: count,
      repo: packageJson.name.split('/')[1],
      label: packageJson.name,
      owner: 'Stradivario',
      folderName: dir.replace(/^.*[\\\/]/, ''),
      url: packageJson.repository.url,
      namespace: packageJson.name.split('/')[0].replace('@', ''),
    });
  }
});

writeFileSync(
  "definitions.json",
  JSON.stringify(repos, null, 2),
  "utf8"
);