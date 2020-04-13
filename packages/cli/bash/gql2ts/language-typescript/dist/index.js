"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescriptPrettify_1 = require("./typescriptPrettify");
const humps_1 = require("humps");
exports.DEFAULT_INTERFACE_DECLARATION = fields => `{
${fields.join('\n')}
}`;
exports.DEFAULT_INTERFACE_BUILDER = (name, body) => `interface ${name} ${body}`;
exports.DEFAULT_INTERFACE_NAMER = name => `I${humps_1.pascalize(name)}`;
exports.DEFAULT_TYPE_BUILDER = (name, body) => `type ${name} = ${body}`;
exports.DEFAULT_TYPE_JOINER = types => types.join(' & ');
exports.DEFAULT_TYPE_NAMER = name => name;
exports.interfaceExtendListToString = exts => {
    if (!exts.length) {
        return '';
    }
    return ` extends ${exts.join(', ')}`;
};
exports.ADD_INTERFACE_EXTENSIONS = (opName, exts) => opName + exports.interfaceExtendListToString(exts);
exports.DEFAULT_NAME_FRAGMENT = name => `IFragment${humps_1.pascalize(name)}`;
exports.DEFAULT_NAME_QUERY = def => def.name ? humps_1.pascalize(def.name.value) : 'Anonymous';
exports.DEFAULT_FORMAT_INPUT = (name, isOptional, type) => exports.ADD_SEMICOLON(`${name}${isOptional ? '?:' : ':'} ${type}`);
exports.DEFAULT_TYPE_MAP = {
    ID: 'string',
    String: 'string',
    Boolean: 'boolean',
    Float: 'number',
    Int: 'number',
    __DEFAULT: 'any',
};
exports.DEFAULT_WRAP_LIST = type => `Array<${type}>`;
exports.DEFAULT_WRAP_PARTIAL = partial => `Partial<${partial}>`;
exports.DEFAULT_TYPE_PRINTER = (type, isNonNull) => isNonNull ? type : `${type} | null`;
exports.DEFAULT_GENERATE_SUBTYPE_INTERFACE_NAME = selectionName => `SelectionOn${humps_1.pascalize(selectionName)}`;
exports.DEFAULT_ENUM_FORMATTER = values => values.map(v => `'${v.value}'`).join(' | ');
exports.DEFAULT_ENUM_NAME_GENERATOR = name => `I${humps_1.pascalize(name)}Enum`;
exports.DEFAULT_INPUT_NAME_GENERATOR = name => `${humps_1.pascalize(name)}Input`;
exports.DEFAULT_EXPORT_FUNCTION = declaration => `export ${declaration}`;
exports.ADD_SEMICOLON = str => `${str};`;
exports.DEFAULT_NAMESPACE_GENERATOR = (namespaceName, interfaces) => `// tslint:disable
// graphql typescript definitions


${interfaces}


// tslint:enable
`;
exports.DEFAULT_OPTIONS = {
    wrapList: exports.DEFAULT_WRAP_LIST,
    wrapPartial: exports.DEFAULT_WRAP_PARTIAL,
    generateSubTypeInterfaceName: exports.DEFAULT_GENERATE_SUBTYPE_INTERFACE_NAME,
    printType: exports.DEFAULT_TYPE_PRINTER,
    formatInput: exports.DEFAULT_FORMAT_INPUT,
    generateFragmentName: exports.DEFAULT_NAME_FRAGMENT,
    generateQueryName: exports.DEFAULT_NAME_QUERY,
    formatEnum: exports.DEFAULT_ENUM_FORMATTER,
    interfaceBuilder: exports.DEFAULT_INTERFACE_BUILDER,
    typeBuilder: exports.DEFAULT_TYPE_BUILDER,
    typeJoiner: exports.DEFAULT_TYPE_JOINER,
    generateInterfaceDeclaration: exports.DEFAULT_INTERFACE_DECLARATION,
    generateEnumName: exports.DEFAULT_ENUM_NAME_GENERATOR,
    generateTypeName: exports.DEFAULT_TYPE_NAMER,
    generateInterfaceName: exports.DEFAULT_INTERFACE_NAMER,
    exportFunction: exports.DEFAULT_EXPORT_FUNCTION,
    addSemicolon: exports.ADD_SEMICOLON,
    generateNamespace: exports.DEFAULT_NAMESPACE_GENERATOR,
    postProcessor: typescriptPrettify_1.default,
    generateInputName: exports.DEFAULT_INPUT_NAME_GENERATOR,
    addExtensionsToInterfaceName: exports.ADD_INTERFACE_EXTENSIONS
};
exports.default = exports.DEFAULT_OPTIONS;
//# sourceMappingURL=index.js.map
