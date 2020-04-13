"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const util_1 = require("../../util/dist");
const language_typescript_1 = require("../../language-typescript/dist");
const run = (schemaInput, optionsInput) => {
    const { generateEnumName, generateInterfaceName, generateTypeName, printType, formatInput, wrapList, formatEnum, typeBuilder, generateInterfaceDeclaration: gID, interfaceBuilder, addSemicolon, } = optionsInput.formats;
    const TYPE_MAP = Object.assign({}, language_typescript_1.DEFAULT_TYPE_MAP);
    function isScalar(type) {
        return type instanceof graphql_1.GraphQLScalarType || !!type._scalarConfig;
    }
    const generateRootDataName = schema => {
        let rootNamespaces = [];
        const queryType = schema.getQueryType();
        const mutationType = schema.getMutationType();
        const subscriptionType = schema.getSubscriptionType();
        if (queryType) {
            rootNamespaces.push(generateInterfaceName(queryType.name));
        }
        if (mutationType) {
            rootNamespaces.push(generateInterfaceName(mutationType.name));
        }
        if (subscriptionType) {
            rootNamespaces.push(generateInterfaceName(subscriptionType.name));
        }
        return rootNamespaces.join(' | ');
    };
    const generateRootTypes = schema => `  export interface IGraphQLResponseRoot {
    data?: ${generateRootDataName(schema)};
    errors?: Array<IGraphQLResponseError>;
  }

  export interface IGraphQLResponseError {
    message: string;            // Required for all errors
    locations?: Array<IGraphQLResponseErrorLocation>;
    [propName: string]: any;    // 7.2.2 says 'GraphQL servers may provide additional entries to error'
  }

  export interface IGraphQLResponseErrorLocation {
    line: number;
    column: number;
  }`;
    const generateDescription = description => description ? `/**
    description: ${description}
  */` : '';
    const wrapWithDescription = (declaration, description) => `  ${generateDescription(description)}
  ${declaration}`;
    const generateTypeDeclaration = (description, name, possibleTypes) => wrapWithDescription(addSemicolon(typeBuilder(name, possibleTypes)) + '\n\n', description);
    const typeNameDeclaration = name => addSemicolon(`__typename: "${name}"`);
    const generateInterfaceDeclaration = ({ name, description }, declaration, fields, additionalInfo, isInput) => {
        if (!isInput && !optionsInput.ignoreTypeNameDeclaration) {
            fields = [typeNameDeclaration(name), ...fields];
        }
        return additionalInfo + wrapWithDescription(interfaceBuilder(declaration, gID(fields.map(f => `    ${f}`), '  ')), description);
    };
    const generateEnumDeclaration = (description, name, enumValues) => wrapWithDescription(typeBuilder(generateEnumName(name), addSemicolon(formatEnum(enumValues))), description);
    /**
     * TODO
     * - add support for custom types (via optional json file or something)
     * - allow this to return metadata for Non Null types
     */
    const resolveInterfaceName = type => {
        if (util_1.isList(type)) {
            return wrapList(resolveInterfaceName((type).ofType));
        }
        else if (util_1.isNonNullable(type)) {
            return `!${resolveInterfaceName((type).ofType)}`;
        }
        else if (isScalar(type)) {
            return TYPE_MAP[type.name] || TYPE_MAP.__DEFAULT;
        }
        else if (graphql_1.isAbstractType(type)) {
            return generateTypeName(type.name);
        }
        else if (util_1.isEnum(type)) {
            return generateEnumName(type.name);
        }
        else {
            return generateInterfaceName(type.name);
        }
    };
    const fieldToDefinition = (field, isInput, supportsNullability) => {
        let interfaceName = resolveInterfaceName(field.type);
        let isNotNull = interfaceName.includes('!');
        let showNullabiltyAttribute = !isNotNull && supportsNullability;
        if (isNotNull) {
            /**
             * should probably refactor this at some point to have
             * `resolveInterfaceName` return better metadata
             * global regex replace is ugly
             */
            interfaceName = interfaceName.replace(/\!/g, '');
        }
        return formatInput(field.name, isInput && (showNullabiltyAttribute || !isNotNull), printType(interfaceName, !showNullabiltyAttribute));
    };
    const findRootType = type => {
        if (util_1.isList(type) || util_1.isNonNullable(type)) {
            return findRootType(type.ofType);
        }
        return type;
    };
    const filterField = (field, ignoredTypes) => {
        let nestedType = findRootType(field.type);
        return !ignoredTypes.has(nestedType.name);
    };
    function isUnion(type) {
        return type instanceof graphql_1.GraphQLUnionType;
    }
    const generateAbstractTypeDeclaration = (type, ignoredTypes, interfaceMap) => {
        const poss = (isUnion(type)) ? type.getTypes() : interfaceMap.get(type) || [];
        let possibleTypes = poss
            .filter(t => !ignoredTypes.has(t.name))
            .map(t => generateInterfaceName(t.name));
        return generateTypeDeclaration(type.description, generateTypeName(type.name), possibleTypes.join(' | '));
    };
    const typeToInterface = (type, ignoredTypes, supportsNullability, interfaceMap) => {
        if (isScalar(type)) {
            return null;
        }
        if (isUnion(type)) {
            return generateAbstractTypeDeclaration(type, ignoredTypes, interfaceMap);
        }
        if (util_1.isEnum(type)) {
            return `export ${generateEnumDeclaration(type.description, type.name, type.getValues())}`;
        }
        let isInput = type instanceof graphql_1.GraphQLInputObjectType;
        const f1 = type.getFields();
        let f = Object.keys(f1).map(k => f1[k]);
        let fields = f
            .filter(field => filterField(field, ignoredTypes))
            .map(field => [generateDescription(field.description), fieldToDefinition(field, isInput, supportsNullability)])
            .reduce((acc, val) => [...acc, ...val.filter(x => x)], [])
            .filter(field => field);
        let interfaceDeclaration = generateInterfaceName(type.name);
        let additionalInfo = '';
        if (graphql_1.isAbstractType(type)) {
            additionalInfo = generateAbstractTypeDeclaration(type, ignoredTypes, interfaceMap);
        }
        return generateInterfaceDeclaration(type, interfaceDeclaration, fields, additionalInfo, isInput);
    };
    const typesToInterfaces = (schema, options) => {
        const ignoredTypes = new Set(options.ignoredTypes);
        const interfaces = [];
        interfaces.push(generateRootTypes(schema)); // add root entry point & errors
        const supportsNullability = !options.legacy;
        const types = schema.getTypeMap();
        const typeArr = Object.keys(types).map(k => types[k]);
        const interfaceMap = new Map();
        typeArr.forEach(type => {
            if (type instanceof graphql_1.GraphQLObjectType) {
                type.getInterfaces().forEach(iface => {
                    if (interfaceMap.has(iface)) {
                        interfaceMap.set(iface, [...(interfaceMap.get(iface)), type]);
                    }
                    else {
                        interfaceMap.set(iface, [type]);
                    }
                });
            }
        });
        const typesWithExport = [];
        const typeInterfaces = typeArr
            .filter(type => !type.name.startsWith('__')) // remove introspection types
            .filter(type => // remove ignored types
         !ignoredTypes.has(type.name))
            .map(type => // convert to interface
         typeToInterface(type, ignoredTypes, supportsNullability, interfaceMap))
            .filter(type => type); // remove empty ones
        typeInterfaces.forEach(type => {
            const typeInterface = type.replace(/interface/g, "export interface");
            typesWithExport.push(typeInterface.includes('?:') ? typeInterface : typeInterface.replace(/:/g, "?:"))
        });
        return interfaces
            .concat(typesWithExport) // add typeInterfaces to return object
            .join('\n\n'); // add newlines between interfaces
    };
    return typesToInterfaces(schemaInput, optionsInput);
};
exports.schemaToInterfaces = (schema, options = {}, formatters = {}) => run(util_1.schemaFromInputs(schema), Object.assign({}, options, { formats: Object.assign({}, language_typescript_1.DEFAULT_OPTIONS, formatters) }));
exports.generateNamespace = (namespace, schema, options = {}, overrides = {}) => {
    const formatters = Object.assign({}, language_typescript_1.DEFAULT_OPTIONS, overrides);
    return formatters.postProcessor(formatters.generateNamespace(namespace, exports.schemaToInterfaces(schema, options, formatters)));
};
//# sourceMappingURL=index.js.map
