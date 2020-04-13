"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format = text => {
    try {
        // tslint:disable no-require-imports
        const { format: formatter } = require('prettier');
        return formatter(text, {
            bracketSpacing: true,
            parser: 'typescript',
            semi: true,
            singleQuote: true,
            tabWidth: 2,
            useTabs: false,
        });
    }
    catch (e) {
        return text;
    }
};
exports.default = format;
//# sourceMappingURL=typescriptPrettify.js.map