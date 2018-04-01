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

getDirectories(__dirname).forEach(dir => {
  if (dir.includes(".git")) {
    return;
  }
  repos.push({
    name: JSON.parse(readFileSync(dir + "/package.json", "utf8")).name,
    directory: dir
  });
});

function changeVersion(packages, operation) {
  if (packages) {
    const matches = [];

    for (let dep in packages) {
      repos.forEach(repo => {
        if (dep === repo.name) {
          packages[repo.name] = "^" + buildVersion;
          matches.push({
            name: repo.name,
            packageVersion: packages[repo.name]
          });
        }
      });
    }
    if (matches.length) {
      console.log(operation);
      console.log(JSON.stringify(matches, null, 1));
    }
    return matches;
  }
}

repos.forEach(r => {
  const rawFile = readFileSync(r.directory + "/package.json", "utf8");
  const package = JSON.parse(rawFile);
  console.log("### ", r.name, "###");
  if (process.argv[2] === "--package") {
    package.version = buildVersion;
    writeFileSync(
      r.directory + "/package.json",
      JSON.stringify(package, null, 2),
      "utf8"
    );
  } else {
    const dependencies =
      changeVersion(package.dependencies, "dependencies: ") || [];
    const devDependencies =
      changeVersion(package.devDependencies, "devDependencies: ") || [];
    const peerDependencies =
      changeVersion(package.peerDependencies, "peerDependencies") || [];

    const matches = [...dependencies, ...devDependencies, ...peerDependencies];

    if (matches.length) {
      console.log("Found dependencies!");
      writeFileSync(
        r.directory + "/package.json",
        JSON.stringify(package, null, 2),
        "utf8"
      );
      console.log("---------------------------------------------");
    } else {
      console.log("No Matches found");
    }
  }
});
