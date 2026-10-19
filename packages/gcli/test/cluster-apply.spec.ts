import 'jest';

import {
  ClusterCurrent,
  planClusterChanges,
  validateDesired,
} from '../src/commands/cluster/helpers/plan';

const cluster = (over: Partial<ClusterCurrent> = {}): ClusterCurrent => ({
  id: 'c1',
  name: 'prod',
  status: 'ready',
  topology: { workers: 2, singleNode: false, controlPlanes: 1 },
  withLoadBalancer: false,
  autoscale: { enabled: false, minWorkers: 1, maxWorkers: 5 },
  ...over,
});

const kinds = (plan: { steps: { kind: string }[] }) =>
  plan.steps.map((s) => s.kind);

describe('[cluster:apply plan]', () => {
  it('creates a missing cluster in its desired shape, then sets autoscaling', () => {
    const plan = planClusterChanges(null, {
      name: 'prod',
      imageId: 'img',
      serverType: 'cpx22',
      location: 'nbg1',
      workers: 3,
      loadBalancer: true,
      autoscale: { enabled: true, minWorkers: 2, maxWorkers: 6 },
    });
    expect(kinds(plan)).toEqual(['create', 'autoscale']);
    expect(plan.steps[0].description).toContain('3 worker(s)');
  });

  it('is empty when the cluster already matches (only keys in the spec count)', () => {
    expect(
      planClusterChanges(cluster(), {
        name: 'prod',
        workers: 2,
        loadBalancer: false,
        autoscale: { enabled: false },
      }).steps,
    ).toEqual([]);
    expect(planClusterChanges(cluster(), { name: 'prod' }).steps).toEqual([]);
  });

  it('orders topology, workers, control planes, load balancer, autoscaling', () => {
    const plan = planClusterChanges(
      cluster({
        topology: { workers: 0, singleNode: true, controlPlanes: 1 },
      }),
      {
        name: 'prod',
        singleNode: false,
        workers: 3,
        controlPlanes: 3,
        loadBalancer: true,
        autoscale: { enabled: true, maxWorkers: 6 },
      },
    );
    expect(kinds(plan)).toEqual([
      'multi-node',
      'control-planes',
      'load-balancer',
      'autoscale',
    ]);
    // The conversion already creates the workers: no separate scale step.
    expect(plan.steps[0]).toMatchObject({ kind: 'multi-node', workers: 3 });
  });

  it('scales workers only when autoscaling does not own them', () => {
    expect(
      kinds(planClusterChanges(cluster(), { name: 'prod', workers: 4 })),
    ).toEqual(['scale']);
    const owned = planClusterChanges(cluster(), {
      name: 'prod',
      workers: 4,
      autoscale: { enabled: true },
    });
    expect(kinds(owned)).toEqual(['autoscale']);
    expect(owned.notes[0]).toContain('autoscaler owns the worker count');
  });

  it('sends only the autoscale settings that differ', () => {
    const plan = planClusterChanges(cluster(), {
      name: 'prod',
      autoscale: { enabled: true, minWorkers: 1, maxWorkers: 8 },
    });
    expect(plan.steps).toEqual([
      expect.objectContaining({
        kind: 'autoscale',
        input: { enabled: true, maxWorkers: 8 },
      }),
    ]);
  });

  it('marks capacity- or IP-removing steps destructive', () => {
    const plan = planClusterChanges(cluster({ withLoadBalancer: true }), {
      name: 'prod',
      singleNode: true,
      loadBalancer: false,
    });
    expect(plan.steps).toEqual([
      expect.objectContaining({ kind: 'single-node', destructive: true }),
      expect.objectContaining({
        kind: 'load-balancer',
        enabled: false,
        destructive: true,
      }),
    ]);
  });

  it('validates the spec like the server does', () => {
    expect(
      validateDesired({ name: 'prod', workers: 2, controlPlanes: 3 }),
    ).toEqual([]);
    expect(
      validateDesired({
        name: '',
        workers: 11,
        controlPlanes: 2,
        singleNode: true,
        autoscale: {
          enabled: true,
          minWorkers: 5,
          maxWorkers: 3,
          cooldownMinutes: 5000,
        },
      }),
    ).toEqual([
      'cluster.name is required',
      'cluster.workers must be an integer from 1 to 10',
      'cluster.controlPlanes must be 1, 3 or 5',
      'cluster.autoscale.cooldownMinutes must be an integer from 1 to 1440',
      'cluster.autoscale.maxWorkers must be >= minWorkers',
      'cluster.autoscale.enabled needs a multi-node cluster (singleNode: false)',
    ]);
    expect(
      validateDesired({ name: 'x', autoscale: { typo: 1 } as never }),
    ).toEqual(['cluster.autoscale.typo is not a known setting']);
  });
});
