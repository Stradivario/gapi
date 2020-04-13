"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isDeprecated(field) {
    return !!field.isDeprecated;
}
function hasDefaultValue(field) {
    return ({}.hasOwnProperty.call(field, 'defaultValue') &&
        field.defaultValue !== undefined);
}
exports.getDocTags = null;
exports.buildDocumentation = field => {
    const tags = [];
    if (hasDefaultValue(field)) {
        tags.push({
            tag: 'default',
            value: field.defaultValue
        });
    }
    if (isDeprecated(field)) {
        tags.push({
            tag: 'deprecated',
            value: field.deprecationReason || ''
        });
    }
    return {
        description: field.description,
        tags,
    };
};
//# sourceMappingURL=parser.js.map