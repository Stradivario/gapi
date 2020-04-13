"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
exports.badWriteHandler = err => { if (err) {
    throw err;
} };
exports.readFile = fileName => {
    const stringifiedFile = fs.readFileSync(fileName).toString();
    if (fileName.endsWith('.json')) {
        // force JSON Parse
        return JSON.parse(stringifiedFile);
    }
    else if (fileName.endsWith('.graphql') || fileName.endsWith('.gql')) {
        // assume graphql schema language
        return stringifiedFile;
    }
    else {
        // fallback when the type is unknown
        return exports.safeJSONParse(stringifiedFile);
    }
};
exports.safeJSONParse = possibleJson => {
    try {
        return JSON.parse(possibleJson);
    }
    catch (e) {
        return possibleJson;
    }
};
exports.writeToFile = (fileName, data) => fs.writeFile(fileName, data, exports.badWriteHandler);
//# sourceMappingURL=fileIO.js.map