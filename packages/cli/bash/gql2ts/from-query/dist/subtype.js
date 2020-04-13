"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSubtypeCache = () => {
    const GeneratedSubtypes = new Map();
    const compareNoWhitespace = (a, b) => a.replace(/\s/g, '') === b.replace(/\s/g, '');
    const subTypeCacheHit = (name, declaration) => compareNoWhitespace(GeneratedSubtypes.get(name), declaration);
    const generateEnumeratedName = (name, count) => `${name}${count}`;
    const enumerateSubtypes = (name, declaration) => {
        if (!GeneratedSubtypes.has(name) || subTypeCacheHit(name, declaration)) {
            return { name, dupe: subTypeCacheHit(name, declaration) };
        }
        let i = 1;
        while (true) {
            let tempName = generateEnumeratedName(name, i);
            if (GeneratedSubtypes.has(tempName) && !subTypeCacheHit(tempName, declaration)) {
                i++;
                continue;
            }
            else {
                if (GeneratedSubtypes.has(tempName)) {
                    return { name: tempName, dupe: true };
                }
                else {
                    GeneratedSubtypes.set(tempName, declaration);
                    return { name: tempName, dupe: false };
                }
            }
        }
    };
    const subTypeStuff = (subtype, declaration) => {
        if (!subtype) {
            return subtype;
        }
        if (GeneratedSubtypes.has(subtype)) {
            return enumerateSubtypes(subtype, declaration);
        }
        else {
            GeneratedSubtypes.set(subtype, declaration);
        }
        return { name: subtype, dupe: false };
    };
    const getSubtype = (selection, declaration, generateSubTypeInterfaceName) => subTypeStuff(generateSubTypeInterfaceName(selection.name.value, selection), declaration);
    return getSubtype;
};
//# sourceMappingURL=subtype.js.map