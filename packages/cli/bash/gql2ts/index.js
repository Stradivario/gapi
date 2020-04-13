#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const fs = require("fs");
const util_1 = require("./util/dist");
const from_schema_1 = require("./from-schema/dist");
const from_query_1 = require("./from-query/dist");
// tslint:disable-next-line no-require-imports no-var-requires
// const { version } = require('../package.json');
program
    .version('1.7.0')
    .usage('[options] <schema.json | schema.gql> <query.gql>')
    .option('-o --output-file [outputFile]', 'name for output file, will use stdout if not specified')
    .option('-n --namespace [namespace]', 'name for the namespace, defaults to "GQL"', 'GQL')
    .option('-i --ignored-types <ignoredTypes>', 'names of types to ignore (comma delimited)', v => v.split(','), [])
    .option('-l --legacy', 'Use TypeScript 1.x annotation', false)
    .option('-e --external-options [externalOptions]', 'ES Module with method overwrites')
    .option('--ignore-type-name-declaration', 'Whether to exclude __typename', false)
    .option('--exclude-deprecated-fields', 'Whether to exclude deprecated fields', false)
    .parse(process.argv);
const run = (schema, options) => {
    let defaultOverrides = {};
    if (program.externalOptions) {
        // tslint:disable-next-line no-require-imports no-var-requires
        const externalFile = require(program.externalOptions);
        defaultOverrides = externalFile.default || externalFile;
    }
    if (program.args[1]) {
        const queryFile = program.args[1];
        const query = fs.readFileSync(queryFile).toString();
        const info = from_query_1.default(schema, query, {}, defaultOverrides);
        const toWrite = info.map(inf => inf.result).join('\n\n');
        if (options.outputFile) {
            util_1.writeToFile(options.outputFile, toWrite);
        }
        else {
            console.log(toWrite);
        }
        return;
    }
    let namespace = from_schema_1.generateNamespace(options.namespace, schema, options, defaultOverrides);
    if (options.outputFile) {
        util_1.writeToFile(options.outputFile, namespace);
    }
    else {
        console.log(namespace);
    }
};
const fileName = program.args[0];
if (fileName) {
    const schema = util_1.readFile(fileName);
    run(schema, program);
}
else if (!process.stdin.isTTY) {
    let input = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
        input += data;
    });
    process.stdin.on('end', () => run(util_1.safeJSONParse(input), program));
}
else {
    console.error('No input specified. Please use stdin or a file name.');
    program.outputHelp();
}
//# sourceMappingURL=index.js.map