import 'jest';

import { watchSeconds } from '../src/commands/cluster/health';
import {
  ago,
  amountOf,
  bar,
  healthView,
  nodeLines,
  sizeOf,
  statusView,
} from '../src/commands/cluster/helpers/health-view';
import { ClusterOverview } from '../src/commands/cluster/types';

const GIB = 1024 ** 3;
const now = new Date('2026-11-26T20:00:00Z');

// instance-stage, 2026-11-26: a 6 CPU / 12 GiB virtual cluster
const stage: ClusterOverview = {
  clusterId: 'c1',
  name: 'instance-stage',
  status: 'ready',
  overall: 'healthy',
  agentOnline: true,
  agentVersion: '0.12.0',
  health: {
    reportedAt: '2026-11-26T19:59:48Z',
    pods: 52,
    pendingPods: 0,
    cpuRequestsPercent: 44.7,
    cpuUsagePercent: 20.5,
    memRequestsPercent: 40,
    memUsagePercent: 35,
    usageSource: 'host',
    capacity: {
      cpu: 6000,
      memory: 12 * GIB,
      cpuSource: 'limit',
      memSource: 'limit',
    },
    fissionReady: true,
    prometheusReady: true,
  },
  issues: [],
};

describe('[cluster:health view]', () => {
  it('draws bars in eighths of a cell', () => {
    expect(bar(50, 4)).toBe('██░░');
    expect(bar(45, 4)).toBe('█▊░░');
    expect(bar(0, 3)).toBe('░░░');
    expect(bar(250, 2)).toBe('██');
  });

  it('says what a percentage is of', () => {
    const capacity = stage.health?.capacity;
    expect(amountOf('cpu', 44.7, capacity)).toBe('2.7 of 6 CPU');
    expect(amountOf('memory', 35, capacity)).toBe('4.2 of 12 GiB');
    expect(amountOf('cpu', null, capacity)).toBe('');
    expect(amountOf('cpu', 10, null)).toBe('');
    expect(sizeOf(capacity)).toBe('6 CPU · 12 GiB, cluster size');
    expect(ago('2026-11-26T19:59:48Z', now)).toBe('12s ago');
    expect(ago('2026-11-26T19:55:00Z', now)).toBe('5m ago');
  });

  it('renders the whole screen of a virtual cluster', () => {
    const lines = healthView(
      stage,
      {
        id: 'h',
        clusterId: 'c1',
        createdAt: '',
        nodes: [
          {
            name: 'plana-node-1',
            podCount: 10,
            cpuRequests: 500,
            cpuAllocatable: 16000,
          },
        ],
      },
      now,
    );
    expect(lines[0]).toBe(
      'instance-stage  ● healthy  6 CPU · 12 GiB, cluster size · agent 0.12.0 · 12s ago',
    );
    expect(lines).toContain(
      'CPU requested  █████████░░░░░░░░░░░   45%    2.7 of 6 CPU',
    );
    expect(lines).toContain(
      'CPU used       ████▏░░░░░░░░░░░░░░░   21%    1.2 of 6 CPU     (host)',
    );
    expect(lines).toContain(
      'Pods 52 · pending 0 · runtime ✔ ready · prometheus ✔ ready',
    );
    // a stand-in node: the amount, not a bar against the host machine
    expect(lines).toContain('plana-node-1    10   0.5 CPU');
    expect(lines[lines.length - 1]).toBe('✔  No issues');
  });

  it("measures a real cluster's nodes against themselves", () => {
    expect(
      nodeLines(
        [
          {
            name: 'w-1',
            podCount: 35,
            cpuRequests: 1600,
            cpuAllocatable: 2000,
            cordoned: true,
          },
        ],
        { cpu: 2000, memory: GIB, cpuSource: 'nodes', memSource: 'nodes' },
      )[1],
    ).toBe('w-1      35  ████████░░   80%  1.6 of 2 CPU  cordoned');
  });

  it('lists issues with their severity symbol', () => {
    const lines = statusView(
      [
        {
          ...stage,
          overall: 'degraded',
          issues: [
            {
              severity: 'warning',
              code: 'pending-pods',
              message: '3 pod(s) cannot be scheduled',
            },
          ],
        },
      ],
      now,
    );
    expect(lines[0]).toContain('● degraded');
    expect(lines[1]).toBe('  CPU ██████▎░░░░░░░  45% requested · 21% used');
    expect(lines[3]).toBe('  ⚠  3 pod(s) cannot be scheduled');
  });

  it('validates --watch', () => {
    expect(watchSeconds(undefined)).toBe(0);
    expect(watchSeconds(true)).toBe(30);
    expect(watchSeconds('10')).toBe(10);
    expect(() => watchSeconds('2')).toThrow(/at least 5/);
  });
});
