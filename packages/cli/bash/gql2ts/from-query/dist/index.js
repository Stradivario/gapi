"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const util_1 = require("../../util/dist");
const language_typescript_1 = require("../../language-typescript/dist");
const subtype_1 = require("./subtype");
const doIt = (schema, query, typeMap = {}, providedOptions = {}) => {
    const enumDeclarations = new Map();
    const TypeMap = Object.assign({}, language_typescript_1.DEFAULT_TYPE_MAP, typeMap);
    const { wrapList, wrapPartial, generateSubTypeInterfaceName, printType, formatInput, generateFragmentName, generateQueryName, interfaceBuilder, typeBuilder, typeJoiner, generateInterfaceDeclaration, exportFunction, postProcessor, generateInputName, addExtensionsToInterfaceName, enumTypeBuilder, formatEnum, generateEnumName, generateDocumentation } = Object.assign({}, language_typescript_1.DEFAULT_OPTIONS, providedOptions);
    const getSubtype = subtype_1.GenerateSubtypeCache();
    const parsedSchema = util_1.schemaFromInputs(schema);
    const parsedSelection = graphql_1.parse(query);
    const handleInputObject = (type, isNonNull) => {
        const variables = Object.keys(type.getFields()).map(k => type.getFields()[k]);
        const variableDeclarations = variables.map(v => formatInput(v.name, true, convertToType(v.type)));
        const builder = generateInterfaceDeclaration(variableDeclarations.map(v => v));
        return printType(builder, isNonNull);
    };
    const handleEnum = (type, isNonNull) => {
        const enumName = generateEnumName(type.name);
        if (!enumDeclarations.has(type.name)) {
            const enumDeclaration = enumTypeBuilder(enumName, formatEnum(type.getValues(), generateDocumentation));
            enumDeclarations.set(type.name, enumDeclaration);
        }
        return printType(enumName, isNonNull);
    };
    const handleNamedTypeInput = (type, isNonNull) => {
        if (type.kind === 'NamedType' && type.name.kind === 'Name' && type.name.value) {
            const newType = parsedSchema.getType(type.name.value);
            if (newType instanceof graphql_1.GraphQLEnumType) {
                return handleEnum(newType, isNonNull);
            }
            else if (newType instanceof graphql_1.GraphQLInputObjectType) {
                return handleInputObject(newType, isNonNull);
            }
        }
    };
    const handleRegularType = (type, isNonNull, replacement) => {
        const typeValue = (typeof type.name === 'string') ? type.toString() : type.name.value;
        const showValue = replacement || typeValue;
        const show = TypeMap[showValue] || (replacement ? showValue : TypeMap.__DEFAULT);
        return printType(show, isNonNull);
    };
    const convertVariable = (type, isNonNull = false, replacement = null) => {
        if (type.kind === 'ListType') {
            return printType(wrapList(convertVariable(type.type, false, replacement)), isNonNull);
        }
        else if (type.kind === 'NonNullType') {
            return convertVariable(type.type, true, replacement);
        }
        else {
            return handleNamedTypeInput(type, isNonNull) || handleRegularType(type, isNonNull, replacement);
        }
    };
    const convertToType = (type, isNonNull = false, replacement = null) => {
        if (util_1.isList(type)) {
            return printType(wrapList(convertToType(type.ofType, false, replacement)), isNonNull);
        }
        else if (util_1.isNonNullable(type)) {
            return convertToType(type.ofType, true, replacement);
        }
        else if (util_1.isEnum(type)) {
            return handleEnum(type, isNonNull);
        }
        else {
            return handleRegularType(type, isNonNull, replacement);
        }
    };
    const UndefinedDirectives = new Set(['include', 'skip']);
    const isUndefinedFromDirective = directives => {
        if (!directives || !directives.length) {
            return false;
        }
        const badDirectives = directives.filter(d => !UndefinedDirectives.has(d.name.value));
        const hasDirectives = directives.some(d => UndefinedDirectives.has(d.name.value));
        if (badDirectives.length) {
            console.error('Found some unknown directives:');
            badDirectives.forEach(d => console.error(d.name.value));
        }
        return hasDirectives;
    };
    const getOperationFields = operation => {
        switch (operation) {
            case 'query':
                return parsedSchema.getQueryType();
            case 'mutation':
                return parsedSchema.getMutationType();
            case 'subscription':
                return parsedSchema.getSubscriptionType();
            default:
                throw new Error('Unsupported Operation');
        }
    };
    const wrapPossiblePartial = possiblePartial => {
        if (possiblePartial.isPartial) {
            return wrapPartial(possiblePartial.iface);
        }
        else {
            return possiblePartial.iface;
        }
    };
    const flattenComplexTypes = children => (children.reduce((acc, child) => { acc.push(...child.complexTypes); return acc; }, []));
    const getField = (operation, selection, parent) => {
        if (parent && graphql_1.isCompositeType(parent)) {
            if (parent instanceof graphql_1.GraphQLUnionType) {
                return parent.getTypes().map(t => t.getFields()[selection.name.value]).find(z => !!z);
            }
            else {
                return parent.getFields()[selection.name.value];
            }
        }
        else {
            const operationFields = getOperationFields(operation);
            // operation is taken from the schema, so it should never be falsy
            return operationFields.getFields()[selection.name.value];
        }
    };
    const getChildSelections = (operation, selection, parent, isUndefined = false) => {
        let str = '';
        let isFragment = false;
        let isPartial = false;
        let complexTypes = [];
        if (selection.kind === 'Field') {
            const field = getField(operation, selection, parent);
            const selectionName = selection.alias ? selection.alias.value : selection.name.value;
            let childType;
            isUndefined = isUndefined || isUndefinedFromDirective(selection.directives);
            let resolvedType;
            if (selectionName.startsWith('__')) {
                resolvedType = TypeMap.String;
            }
            else if (!!selection.selectionSet) {
                let newParent;
                const fieldType = graphql_1.getNamedType(field.type);
                if (graphql_1.isCompositeType(fieldType)) {
                    newParent = fieldType;
                }
                const selections = selection.selectionSet.selections.map(sel => getChildSelections(operation, sel, newParent));
                const nonFragments = selections.filter(s => !s.isFragment);
                const fragments = selections.filter(s => s.isFragment);
                const andOps = [];
                complexTypes.push(...flattenComplexTypes(selections));
                if (nonFragments.length) {
                    const nonPartialNonFragments = nonFragments.filter(nf => !nf.isPartial);
                    const partialNonFragments = nonFragments.filter(nf => nf.isPartial);
                    if (nonPartialNonFragments.length) {
                        const interfaceDeclaration = generateInterfaceDeclaration(nonPartialNonFragments.map(f => f.iface));
                        const subtypeInfo = getSubtype(selection, interfaceDeclaration, generateSubTypeInterfaceName);
                        const newInterfaceName = subtypeInfo ? subtypeInfo.name : null;
                        andOps.push(newInterfaceName || interfaceDeclaration);
                        if (newInterfaceName && subtypeInfo && !subtypeInfo.dupe) {
                            complexTypes.push({ iface: interfaceDeclaration, isPartial: false, name: newInterfaceName });
                        }
                    }
                    if (partialNonFragments.length) {
                        const interfaceDeclaration = wrapPartial(generateInterfaceDeclaration(partialNonFragments.map(f => f.iface)));
                        const subtypeInfo = getSubtype(selection, interfaceDeclaration, generateSubTypeInterfaceName);
                        const newInterfaceName = subtypeInfo ? subtypeInfo.name : null;
                        andOps.push(newInterfaceName || interfaceDeclaration);
                        if (newInterfaceName && subtypeInfo && !subtypeInfo.dupe) {
                            complexTypes.push({ iface: interfaceDeclaration, isPartial: true, name: newInterfaceName });
                        }
                    }
                }
                andOps.push(...fragments.map(wrapPossiblePartial));
                childType = typeJoiner(andOps);
                resolvedType = convertToType(field.type, false, childType);
            }
            else {
                resolvedType = convertToType(field.type, false, childType);
            }
            str = formatInput(selectionName, isUndefined, resolvedType);
        }
        else if (selection.kind === 'FragmentSpread') {
            str = generateFragmentName(selection.name.value);
            isFragment = true;
            isPartial = isUndefinedFromDirective(selection.directives);
        }
        else if (selection.kind === 'InlineFragment') {
            const anon = !selection.typeCondition;
            if (!anon) {
                const typeName = selection.typeCondition.name.value;
                parent = parsedSchema.getType(typeName);
            }
            const selections = selection.selectionSet.selections.map(sel => getChildSelections(operation, sel, parent, !anon));
            let joinSelections = util_1.filterAndJoinArray(selections.map(s => s.iface), '\n');
            isPartial = isUndefinedFromDirective(selection.directives);
            complexTypes.push(...flattenComplexTypes(selections));
            return {
                iface: joinSelections,
                isFragment,
                isPartial,
                complexTypes,
            };
        }
        return {
            iface: str,
            isFragment,
            isPartial,
            complexTypes,
        };
    };
    const getVariables = variables => (variables.map(v => {
        const optional = v.type.kind !== 'NonNullType';
        return formatInput(v.variable.name.value, optional, convertVariable(v.type));
    }));
    const variablesToInterface = (opName, variables) => {
        if (!variables || !variables.length) {
            return '';
        }
        const variableTypeDefs = getVariables(variables);
        return postProcessor(exportFunction(interfaceBuilder(generateInputName(opName), generateInterfaceDeclaration(variableTypeDefs))));
    };
    const buildAdditionalTypes = children => {
        const subTypes = flattenComplexTypes(children);
        return subTypes.map(subtype => {
            if (subtype.isPartial) {
                return postProcessor(exportFunction(typeBuilder(subtype.name, subtype.iface)));
            }
            else {
                return postProcessor(exportFunction(interfaceBuilder(subtype.name, subtype.iface)));
            }
        }).concat([
            ...enumDeclarations.values()
        ].map(enumDecl => postProcessor(exportFunction(enumDecl))));
    };
    const joinOutputs = output => {
        const { variables, additionalTypes, interface: iface } = output;
        const result = postProcessor(util_1.filterAndJoinArray([variables, ...additionalTypes, iface], '\n\n'));
        return Object.assign({}, output, { result });
    };
    return parsedSelection.definitions.map(def => {
        if (def.kind === 'OperationDefinition') {
            const ifaceName = generateQueryName(def);
            const variableInterface = variablesToInterface(ifaceName, def.variableDefinitions);
            const ret = def.selectionSet.selections.map(sel => getChildSelections(def.operation, sel));
            const fields = ret.map(x => x.iface);
            const iface = postProcessor(exportFunction(interfaceBuilder(ifaceName, generateInterfaceDeclaration(fields))));
            const additionalTypes = buildAdditionalTypes(ret);
            return joinOutputs({
                variables: variableInterface,
                interface: iface,
                additionalTypes,
            });
        }
        else if (def.kind === 'FragmentDefinition') {
            const ifaceName = generateFragmentName(def.name.value);
            // get the correct type
            const onType = def.typeCondition.name.value;
            const foundType = parsedSchema.getType(onType);
            const ret = def.selectionSet.selections.map(sel => getChildSelections('query', sel, foundType));
            const extensions = ret.filter(x => x.isFragment).map(x => x.iface);
            const fields = ret.filter(x => !x.isFragment).map(x => x.iface);
            const iface = postProcessor(exportFunction(interfaceBuilder(addExtensionsToInterfaceName(ifaceName, extensions), generateInterfaceDeclaration(fields))));
            const additionalTypes = buildAdditionalTypes(ret);
            return joinOutputs({
                interface: iface,
                variables: '',
                additionalTypes,
            });
        }
        else {
            throw new Error(`Unsupported Definition ${def.kind}`);
        }
    });
};
exports.default = doIt;
//# sourceMappingURL=index.js.map