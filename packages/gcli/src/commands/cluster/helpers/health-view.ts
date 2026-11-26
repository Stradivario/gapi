import { paint, SYMBOLS, unicode } from '~/services/ui';

import {
  ClusterCapacity,
  ClusterHealthNode,
  ClusterHealthSnapshot,
  ClusterOverview,
} from '../types';

/**
 * cluster:health / cluster:status as a terminal dashboard (feature
 * cli-output): a header line, a meter per resource ("2.7 of 6 CPU" - what
 * the percentage is OF, the same total the web page uses: the nodes, or a
 * virtual cluster's own size), the nodes with a small bar each, and the
 * open issues. Pure - every function returns lines; colour comes from
 * `paint`, so a pipe or NO_COLOR gets plain text, and a terminal without
 * unicode gets '#'/'-' bars.
 */

const BLOCKS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];

/** The same thresholds as the web meters: orange from 70%, red from 85%. */
const toneOf = (percent: number) =>
  percent >= 85 ? 'red' : percent >= 70 ? 'yellow' : 'green';

/** A bar `width` cells wide; eighths of a cell on a unicode terminal. */
export function bar(percent: number | null | undefined, width = 20): string {
  const p = Math.max(0, Math.min(100, percent ?? 0));
  if (!unicode) {
    const full = Math.round((p / 100) * width);
    return (
      paint('#'.repeat(full), [toneOf(p)]) +
      paint('-'.repeat(width - full), ['dim'])
    );
  }
  const eighths = Math.round((p / 100) * width * 8);
  const full = Math.floor(eighths / 8);
  const part = BLOCKS[eighths % 8];
  const rest = width - full - (part ? 1 : 0);
  return (
    paint('█'.repeat(full) + part, [percent == null ? 'dim' : toneOf(p)]) +
    paint('░'.repeat(rest), ['dim'])
  );
}

const pct = (v?: number | null) => (v == null ? '-' : `${Math.round(v)}%`);

/** One decimal below 100 (12.8 GiB), whole numbers above. */
const num = (v: number) =>
  String(v >= 100 ? Math.round(v) : Math.round(v * 10) / 10);

const GIB = 1024 ** 3;
const UNITS = {
  cpu: { divisor: 1000, unit: 'CPU' },
  memory: { divisor: GIB, unit: 'GiB' },
} as const;
type Kind = keyof typeof UNITS;

/** "2.7 of 6 CPU"; empty when the percentage or the total is unknown. */
export function amountOf(
  kind: Kind,
  percent: number | null | undefined,
  capacity: ClusterCapacity | null | undefined,
): string {
  const total = capacity ? capacity[kind] / UNITS[kind].divisor : 0;
  if (percent == null || !(total > 0)) return '';
  return `${num((total * percent) / 100)} of ${num(total)} ${UNITS[kind].unit}`;
}

/** "6 CPU · 12 GiB, cluster size" */
export function sizeOf(capacity: ClusterCapacity | null | undefined): string {
  if (!capacity) return '';
  const source =
    capacity.cpuSource === 'limit' || capacity.memSource === 'limit'
      ? 'cluster size'
      : 'nodes';
  return `${num(capacity.cpu / 1000)} CPU ${SYMBOLS.dot} ${num(capacity.memory / GIB)} GiB, ${source}`;
}

/** "12s ago", "4m ago", "2h ago" */
export function ago(iso: string | null | undefined, now: Date): string {
  if (!iso) return '';
  const s = Math.max(0, Math.round((now.getTime() - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const OVERALL_STYLE: Record<string, Parameters<typeof paint>[1]> = {
  healthy: ['green'],
  degraded: ['yellow'],
  critical: ['red'],
};

const dot = unicode ? '●' : '*';

/** `name  ● healthy  6 CPU · 12 GiB, cluster size · agent 0.12.0 · 12s ago` */
export function headerLine(c: ClusterOverview, now: Date): string {
  const overall = c.overall || c.status;
  const badge = paint(`${dot} ${overall}`, OVERALL_STYLE[overall] ?? ['dim']);
  const details = [
    c.status !== 'ready' ? c.status : '',
    sizeOf(c.health?.capacity),
    c.agentVersion ? `agent ${c.agentVersion}` : '',
    c.agentOnline === false ? 'agent offline' : '',
    ago(c.health?.reportedAt ?? c.agentLastSeenAt, now),
  ].filter(Boolean);
  return `${paint(c.name, ['bold'])}  ${badge}  ${paint(
    details.join(` ${SYMBOLS.dot} `),
    ['dim'],
  )}`;
}

/** The four meters, label | bar | percent | amount | source. */
export function meterLines(c: ClusterOverview): string[] {
  const h = c.health;
  if (!h) return [paint('No health report yet', ['dim'])];
  const fromHost = h.usageSource === 'host' ? paint('(host)', ['dim']) : '';
  const rows: [string, number | null | undefined, Kind, string][] = [
    ['CPU requested', h.cpuRequestsPercent, 'cpu', ''],
    ['CPU used', h.cpuUsagePercent, 'cpu', fromHost],
    ['Mem requested', h.memRequestsPercent, 'memory', ''],
    ['Mem used', h.memUsagePercent, 'memory', fromHost],
  ];
  return rows.map(([label, value, kind, note]) =>
    [
      label.padEnd(14),
      bar(value),
      pct(value).padStart(5),
      '  ',
      amountOf(kind, value, h.capacity).padEnd(16),
      note,
    ]
      .join(' ')
      .trimEnd(),
  );
}

const readiness = (ok: boolean | undefined) =>
  ok
    ? paint(`${SYMBOLS.success} ready`, ['green'])
    : paint(`${SYMBOLS.error} not ready`, ['red']);

/** "Pods 52 · pending 0 · runtime ✔ ready · prometheus ✔ ready" */
export function podsLine(c: ClusterOverview): string {
  const h = c.health;
  if (!h) return '';
  const pending = h.pendingPods
    ? paint(`pending ${h.pendingPods}`, ['yellow'])
    : 'pending 0';
  return [
    `Pods ${h.pods ?? 0}`,
    pending,
    `runtime ${readiness(h.fissionReady)}`,
    `prometheus ${readiness(h.prometheusReady)}`,
  ].join(` ${SYMBOLS.dot} `);
}

const nodeRequests = (n: ClusterHealthNode) =>
  n.cpuAllocatable ? ((n.cpuRequests ?? 0) / n.cpuAllocatable) * 100 : null;

/** One line per node: name, pods, CPU requested, its state. A node of a
    cluster measured against its own size (a vCluster: its nodes stand in
    for the host's machines) shows the amount only - a bar against the host
    machine would read "3%" on a busy cluster. */
export function nodeLines(
  nodes: ClusterHealthNode[] | undefined,
  capacity?: ClusterCapacity | null,
): string[] {
  if (!nodes?.length) return [];
  const ofHost = capacity?.cpuSource === 'limit';
  const width = Math.max(5, ...nodes.map((n) => n.name.length));
  const head = paint(
    `${'Nodes'.padEnd(width)}  ${'pods'.padStart(4)}  cpu requested`,
    ['dim'],
  );
  return [
    head,
    ...nodes.map((n) => {
      const state = [
        n.ready === false ? paint('not ready', ['red']) : '',
        n.cordoned ? paint('cordoned', ['yellow']) : '',
        n.role === 'control-plane' ? paint('control plane', ['dim']) : '',
      ].filter(Boolean);
      const cores = `${num((n.cpuRequests ?? 0) / 1000)} CPU`;
      const usage = ofHost
        ? [cores.padStart(8)]
        : [
            bar(nodeRequests(n), 10),
            pct(nodeRequests(n)).padStart(4),
            paint(
              n.cpuAllocatable
                ? `${cores.replace(' CPU', '')} of ${num(n.cpuAllocatable / 1000)} CPU`
                : '',
              ['dim'],
            ),
          ];
      return [
        n.name.padEnd(width),
        String(n.podCount ?? 0).padStart(4),
        ...usage,
        ...state,
      ]
        .filter(Boolean)
        .join('  ');
    }),
  ];
}

const ISSUE_SYMBOL: Record<string, [string, Parameters<typeof paint>[1]]> = {
  critical: [SYMBOLS.error, ['red', 'bold']],
  warning: [SYMBOLS.warn, ['yellow', 'bold']],
  info: [SYMBOLS.info, ['cyan', 'bold']],
};

export function issueLines(c: ClusterOverview): string[] {
  const issues = c.issues ?? [];
  if (!issues.length) {
    return [`${paint(SYMBOLS.success, ['green', 'bold'])}  No issues`];
  }
  return issues.map((i) => {
    const [symbol, style] = ISSUE_SYMBOL[i.severity] ?? ISSUE_SYMBOL.info;
    return `${paint(symbol, style)}  ${i.message}`;
  });
}

const rule = (width: number) =>
  paint((unicode ? '─' : '-').repeat(width), ['dim']);

/** The whole cluster:health screen. */
export function healthView(
  overview: ClusterOverview,
  latest: ClusterHealthSnapshot | null,
  now: Date,
): string[] {
  const nodes = nodeLines(latest?.nodes, overview.health?.capacity);
  const pods = podsLine(overview);
  return [
    headerLine(overview, now),
    rule(74),
    ...meterLines(overview),
    ...(pods ? ['', pods] : []),
    ...(nodes.length ? ['', ...nodes] : []),
    '',
    ...issueLines(overview),
  ];
}

/** cluster:status: per cluster the header, two compact meters, issues. */
export function statusView(clusters: ClusterOverview[], now: Date): string[] {
  return clusters.flatMap((c, index) => {
    const h = c.health;
    const compact = (
      label: string,
      requested?: number | null,
      used?: number | null,
    ) =>
      `  ${label.padEnd(4)}${bar(requested, 14)} ${pct(requested).padStart(4)} requested ${SYMBOLS.dot} ${pct(used)} used`;
    return [
      ...(index ? [''] : []),
      headerLine(c, now),
      ...(h
        ? [
            compact('CPU', h.cpuRequestsPercent, h.cpuUsagePercent),
            compact('Mem', h.memRequestsPercent, h.memUsagePercent),
          ]
        : [`  ${paint('No health report yet', ['dim'])}`]),
      ...((c.issues ?? []).length ? issueLines(c).map((l) => `  ${l}`) : []),
    ];
  });
}
