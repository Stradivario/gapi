import * as schemaModule from '~/schema/lambforge.schema.json';

import { Loose } from './drift';

/** esbuild gives the JSON as the module, ts-jest under `.default`. */
const schema: Loose = (schemaModule as Loose).default ?? schemaModule;

/** One finding of `gcli validate`. */
export interface Finding {
  unit: string;
  path: string;
  level: 'error' | 'warning';
  message: string;
}

type Node = Loose;

const typeOf = (v: unknown) =>
  v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;

const typeOk = (want: string | string[], v: unknown) =>
  ([] as string[])
    .concat(want)
    .some((t) => (t === 'integer' ? Number.isInteger(v) : t === typeOf(v)));

const resolveRef = (node: Node): Node =>
  node?.$ref
    ? resolveRef(
        node.$ref
          .replace('#/', '')
          .split('/')
          .reduce((n: Node, k: string) => n[k], schema),
      )
    : node;

/**
 * The JSON Schema subset lambforge.schema.json uses: type, enum, pattern
 * (strings), required, properties, additionalProperties (false = an unknown key is a WARNING -
 * a typo like `servs:` or a key the platform ignores), patternProperties,
 * items, $ref. Wrong types / values and missing required keys are errors.
 */
export function check(
  unit: string,
  value: unknown,
  node: Node = schema,
  path = '',
): Finding[] {
  const n = resolveRef(node);
  const out: Finding[] = [];
  const at = path || '(root)';
  if (n.type && !typeOk(n.type, value)) {
    return [
      {
        unit,
        path: at,
        level: 'error',
        message: `expected ${[].concat(n.type).join(' or ')}, got ${typeOf(value)}`,
      },
    ];
  }
  if (n.enum && !n.enum.includes(value)) {
    return [
      {
        unit,
        path: at,
        level: 'error',
        message: `must be one of ${n.enum.join(', ')}`,
      },
    ];
  }
  if (
    n.pattern &&
    typeof value === 'string' &&
    !new RegExp(n.pattern).test(value)
  ) {
    return [
      {
        unit,
        path: at,
        level: 'error',
        message: `"${value}" does not match ${n.pattern}`,
      },
    ];
  }
  if (typeOf(value) === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key of n.required ?? []) {
      if (!(key in obj))
        out.push({
          unit,
          path: at,
          level: 'error',
          message: `missing \`${key}\``,
        });
    }
    for (const [key, v] of Object.entries(obj)) {
      const child = path ? `${path}.${key}` : key;
      if (n.properties?.[key]) {
        out.push(...check(unit, v, n.properties[key], child));
      } else if (
        Object.keys(n.patternProperties ?? {}).some((p) =>
          new RegExp(p).test(key),
        )
      ) {
        // YAML anchors (`.base: &base`) - not read by gcli
      } else if (typeof n.additionalProperties === 'object') {
        out.push(...check(unit, v, n.additionalProperties, child));
      } else if (n.additionalProperties === false) {
        out.push({
          unit,
          path: child,
          level: 'warning',
          message: 'unknown key - gcli and the platform ignore it',
        });
      }
    }
  }
  if (typeOf(value) === 'array' && n.items) {
    (value as unknown[]).forEach((v, i) =>
      out.push(...check(unit, v, n.items, `${path}[${i}]`)),
    );
  }
  return out;
}
