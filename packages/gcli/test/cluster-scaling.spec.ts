import 'jest';

jest.mock('../src/services/gql-client', () => ({
  GraphqlClienAPI: {
    scaleProjectCluster: jest.fn(),
    scaleControlPlanesProjectCluster: jest.fn(),
    setProjectClusterLoadBalancer: jest.fn(),
    updateProjectClusterAutoscale: jest.fn(),
    projectClustersOverview: jest.fn(),
    projectClusters: jest.fn(),
  },
}));

jest.mock('../src/helpers', () => ({
  parseProjectId: jest.fn(),
  resolveClusterId: jest.fn(),
}));

import { of } from 'rxjs';

import { toAutoscaleInput } from '../src/commands/cluster/autoscale';
import { parseIntOption } from '../src/commands/cluster/helpers/cluster-change';
import loadBalancer from '../src/commands/cluster/load-balancer';
import scale from '../src/commands/cluster/scale';
import scaleControlPlanes from '../src/commands/cluster/scale-control-planes';
import { overviewRow } from '../src/commands/cluster/status';
import { parseProjectId, resolveClusterId } from '../src/helpers';
import { GraphqlClienAPI } from '../src/services/gql-client';

const api = GraphqlClienAPI as unknown as Record<string, jest.Mock>;

const settled = (extra = {}) => ({
  id: 'c1',
  name: 'prod',
  status: 'scaling',
  topology: { workers: 3, singleNode: false, controlPlanes: 1 },
  ...extra,
});

describe('[cluster scaling commands]', () => {
  beforeEach(() => {
    Object.values(api).forEach((m) => m.mockReset());
    (parseProjectId as jest.Mock).mockReturnValue(of('proj-1'));
    (resolveClusterId as jest.Mock).mockReturnValue(of('c1'));
    jest.spyOn(console, 'table').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('parseIntOption', () => {
    it('accepts an integer in range', () => {
      expect(parseIntOption('workers', '3', 1, 10)).toBe(3);
    });
    it.each([['0'], ['11'], ['2.5'], ['abc']])(
      'rejects %s with the range',
      (v) => {
        expect(() => parseIntOption('workers', v, 1, 10)).toThrow(
          '--workers must be an integer from 1 to 10',
        );
      },
    );
    it('requires the flag', () => {
      expect(() => parseIntOption('workers', undefined, 1, 10)).toThrow(
        '--workers is required',
      );
    });
  });

  describe('toAutoscaleInput', () => {
    it('sends only the flags given (the server merges the rest)', () => {
      expect(toAutoscaleInput({ max: '7' })).toEqual({ maxWorkers: 7 });
      expect(
        toAutoscaleInput({
          enable: true,
          min: '2',
          cpuUp: '80',
          cooldown: '30',
        }),
      ).toEqual({
        enabled: true,
        minWorkers: 2,
        cpuScaleUpPercent: 80,
        cooldownMinutes: 30,
      });
      expect(toAutoscaleInput({ disable: true })).toEqual({ enabled: false });
    });
    it('refuses nothing-to-change and conflicting flags', () => {
      expect(() => toAutoscaleInput({})).toThrow('Nothing to change');
      expect(() => toAutoscaleInput({ enable: true, disable: true })).toThrow(
        'not both',
      );
      expect(() => toAutoscaleInput({ samples: '50' })).toThrow('1 to 20');
    });
  });

  it('cluster:scale calls scaleProjectCluster with the resolved cluster', async () => {
    api.scaleProjectCluster.mockReturnValue(of(settled()));
    const result = await scale({ clusterName: 'prod', workers: '3' });
    expect(resolveClusterId).toHaveBeenCalledWith('proj-1', {
      clusterId: undefined,
      clusterName: 'prod',
    });
    expect(api.scaleProjectCluster).toHaveBeenCalledWith('proj-1', 'c1', 3);
    expect(result.status).toBe('scaling');
  });

  it('cluster:scale validates before calling the API', async () => {
    await expect(scale({ cluster: 'c1', workers: '12' })).rejects.toThrow(
      '1 to 10',
    );
    expect(api.scaleProjectCluster).not.toHaveBeenCalled();
  });

  it('cluster:scale needs a cluster', async () => {
    (resolveClusterId as jest.Mock).mockReturnValue(of(undefined));
    await expect(scale({ workers: '2' })).rejects.toThrow('--cluster');
  });

  it('cluster:scale --wait polls until ready', async () => {
    api.scaleProjectCluster.mockReturnValue(of(settled()));
    api.projectClusters.mockReturnValue(
      of([{ id: 'c1', name: 'prod', status: 'ready' }]),
    );
    const result = await scale({ cluster: 'c1', workers: '3', wait: true });
    expect(api.projectClusters).toHaveBeenCalledWith('proj-1');
    expect(result.status).toBe('ready');
  });

  it('cluster:scale --wait fails when the cluster ends in error', async () => {
    api.scaleProjectCluster.mockReturnValue(of(settled()));
    api.projectClusters.mockReturnValue(
      of([{ id: 'c1', status: 'error', error: 'hcloud quota exceeded' }]),
    );
    await expect(
      scale({ cluster: 'c1', workers: '3', wait: true }),
    ).rejects.toThrow('hcloud quota exceeded');
  });

  it('cluster:scale:control-planes only accepts 1, 3 or 5', async () => {
    await expect(
      scaleControlPlanes({ cluster: 'c1', count: '2' }),
    ).rejects.toThrow('1, 3 or 5');
    api.scaleControlPlanesProjectCluster.mockReturnValue(of(settled()));
    await scaleControlPlanes({ cluster: 'c1', count: '3' });
    expect(api.scaleControlPlanesProjectCluster).toHaveBeenCalledWith(
      'proj-1',
      'c1',
      3,
    );
  });

  it('cluster:load-balancer needs exactly one of --enable/--disable', async () => {
    await expect(loadBalancer({ cluster: 'c1' })).rejects.toThrow(
      'exactly one',
    );
    await expect(
      loadBalancer({ cluster: 'c1', enable: true, disable: true }),
    ).rejects.toThrow('exactly one');
    api.setProjectClusterLoadBalancer.mockReturnValue(
      of(settled({ withLoadBalancer: false })),
    );
    await loadBalancer({ cluster: 'c1', disable: true });
    expect(api.setProjectClusterLoadBalancer).toHaveBeenCalledWith(
      'proj-1',
      'c1',
      false,
    );
  });

  it('cluster:status rows summarise health, agent and autoscale', () => {
    expect(
      overviewRow({
        clusterId: 'c1',
        name: 'prod',
        status: 'ready',
        overall: 'healthy',
        agentOnline: true,
        health: {
          nodesReady: 3,
          nodesTotal: 3,
          pods: 40,
          pendingPods: 0,
          cpuUsagePercent: 31.6,
          cpuRequestsPercent: 55,
          memUsagePercent: 48,
          memRequestsPercent: 60,
        },
        autoscale: { enabled: true, minWorkers: 2, maxWorkers: 5 },
      }),
    ).toEqual({
      name: 'prod',
      id: 'c1',
      status: 'ready',
      overall: 'healthy',
      agent: 'online',
      nodes: '3/3 ready',
      pods: '40 (0 pending)',
      cpu: '32% used / 55% req',
      mem: '48% used / 60% req',
      autoscale: 'on 2-5',
    });
  });
});
