import 'jest';

jest.mock('../src/services/gql-client', () => ({
  GraphqlClienAPI: {
    projectClustersDetailed: jest.fn(),
    projectClusters: jest.fn(),
    provisionProjectCluster: jest.fn(),
    scaleProjectCluster: jest.fn(),
    revertToSingleNodeProjectCluster: jest.fn(),
    setProjectClusterLoadBalancer: jest.fn(),
    updateProjectClusterAutoscale: jest.fn(),
  },
}));
jest.mock('../src/helpers', () => ({
  parseProjectId: jest.fn(),
  resolveClusterId: jest.fn(),
}));
jest.mock('../src/commands/lambda/helpers/load-spec', () => ({
  loadSpec: jest.fn(),
}));

import { of } from 'rxjs';

import apply from '../src/commands/cluster/apply';
import { loadSpec } from '../src/commands/lambda/helpers/load-spec';
import { parseProjectId } from '../src/helpers';
import { GraphqlClienAPI } from '../src/services/gql-client';

const api = GraphqlClienAPI as unknown as Record<string, jest.Mock>;
const spec = (cluster: object) =>
  (loadSpec as jest.Mock).mockReturnValue(of({ cluster }));

const existing = {
  id: 'c1',
  name: 'prod',
  status: 'ready',
  topology: { workers: 2, singleNode: false, controlPlanes: 1 },
  withLoadBalancer: true,
  autoscale: { enabled: false },
};

describe('[cluster:apply command]', () => {
  beforeEach(() => {
    Object.values(api).forEach((m) => m.mockReset());
    (parseProjectId as jest.Mock).mockReturnValue(of('proj-1'));
    api.projectClustersDetailed.mockReturnValue(of([existing]));
    // Every background job settles to ready.
    api.projectClusters.mockReturnValue(of([{ ...existing, status: 'ready' }]));
    for (const m of [
      'scaleProjectCluster',
      'revertToSingleNodeProjectCluster',
      'setProjectClusterLoadBalancer',
    ]) {
      api[m].mockReturnValue(of({ ...existing, status: 'scaling' }));
    }
    api.updateProjectClusterAutoscale.mockReturnValue(of(existing));
    for (const k of ['table', 'log', 'info', 'warn'] as const) {
      jest.spyOn(console, k).mockImplementation(() => undefined);
    }
  });

  afterEach(() => jest.restoreAllMocks());

  it('--dry-run plans but changes nothing', async () => {
    spec({ name: 'prod', workers: 4 });
    const result = await apply({ dryRun: true });
    expect(result.applied).toEqual([]);
    expect(api.scaleProjectCluster).not.toHaveBeenCalled();
  });

  it('applies steps in order and skips destructive ones without --yes', async () => {
    spec({
      name: 'prod',
      workers: 4,
      loadBalancer: false,
      autoscale: { maxWorkers: 7 },
    });
    const result = await apply({});
    expect(api.scaleProjectCluster).toHaveBeenCalledWith('proj-1', 'c1', 4);
    expect(api.setProjectClusterLoadBalancer).not.toHaveBeenCalled();
    expect(api.updateProjectClusterAutoscale).toHaveBeenCalledWith(
      'proj-1',
      'c1',
      { maxWorkers: 7 },
    );
    expect(result.applied.map((s) => s.kind)).toEqual(['scale', 'autoscale']);
  });

  it('applies destructive steps with --yes', async () => {
    spec({ name: 'prod', loadBalancer: false });
    await apply({ yes: true });
    expect(api.setProjectClusterLoadBalancer).toHaveBeenCalledWith(
      'proj-1',
      'c1',
      false,
    );
  });

  it('creates a missing cluster with the whole desired shape', async () => {
    api.projectClustersDetailed.mockReturnValue(of([]));
    api.provisionProjectCluster.mockReturnValue(
      of({ id: 'new', name: 'stage', status: 'provisioning' }),
    );
    api.projectClusters.mockReturnValue(
      of([{ id: 'new', name: 'stage', status: 'ready' }]),
    );
    spec({
      name: 'stage',
      imageId: 'img',
      serverType: 'cpx22',
      location: 'nbg1',
      workers: 2,
      controlPlanes: 3,
      loadBalancer: true,
    });
    await apply({});
    expect(api.provisionProjectCluster).toHaveBeenCalledWith('proj-1', {
      name: 'stage',
      imageId: 'img',
      serverType: 'cpx22',
      location: 'nbg1',
      workers: 2,
      singleNode: undefined,
      withLoadBalancer: true,
      controlPlanes: 3,
    });
  });

  it('refuses to create without imageId/serverType/location', async () => {
    api.projectClustersDetailed.mockReturnValue(of([]));
    spec({ name: 'stage' });
    await expect(apply({})).rejects.toThrow(
      'cluster.imageId, cluster.serverType, cluster.location',
    );
  });

  it('refuses an invalid spec and a busy cluster', async () => {
    spec({ name: 'prod', controlPlanes: 2 });
    await expect(apply({})).rejects.toThrow('controlPlanes must be 1, 3 or 5');
    api.projectClustersDetailed.mockReturnValue(
      of([{ ...existing, status: 'scaling' }]),
    );
    spec({ name: 'prod', workers: 3 });
    await expect(apply({})).rejects.toThrow('is "scaling"');
  });

  it('explains a missing cluster section', async () => {
    (loadSpec as jest.Mock).mockReturnValue(of({ function: { name: 'x' } }));
    await expect(apply({})).rejects.toThrow('add a `cluster:` section');
  });
});
