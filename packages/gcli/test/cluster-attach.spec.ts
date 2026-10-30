import 'jest';

import {
  nodeRow,
  parseAttachOptions,
  resetHint,
  serverTalosVersion,
} from '../src/commands/cluster/helpers/attach';

describe('[cluster:attach helpers] (self-managed-nodes)', () => {
  it('parses the options with safe defaults', () => {
    expect(
      parseAttachOptions({ nodeIp: '192.168.1.50', name: 'home-1' }),
    ).toEqual({
      nodeIp: '192.168.1.50',
      name: 'home-1',
      pool: undefined,
      disk: undefined,
      reserved: false,
      yes: false,
      wait: true,
      timeoutMs: 600_000,
    });
    expect(
      parseAttachOptions({
        nodeIp: '192.168.1.50',
        name: 'home-1',
        pool: 'home',
        disk: '/dev/nvme0n1',
        reserved: true,
        wait: false,
        timeout: '20',
      }),
    ).toMatchObject({
      pool: 'home',
      disk: '/dev/nvme0n1',
      reserved: true,
      wait: false,
      timeoutMs: 1_200_000,
    });
  });

  it('refuses missing or unsafe input before anything happens', () => {
    expect(() => parseAttachOptions({ name: 'home-1' })).toThrow('--node-ip');
    expect(() =>
      parseAttachOptions({ nodeIp: '1.2.3.4; rm', name: 'home-1' }),
    ).toThrow('--node-ip');
    expect(() =>
      parseAttachOptions({ nodeIp: '1.2.3.4', name: 'Home_1' }),
    ).toThrow('--name');
    expect(() =>
      parseAttachOptions({ nodeIp: '1.2.3.4', name: 'home-1', pool: 'A B' }),
    ).toThrow('--pool');
    expect(() =>
      parseAttachOptions({
        nodeIp: '1.2.3.4',
        name: 'home-1',
        disk: 'nvme0n1',
      }),
    ).toThrow('--disk');
    expect(() =>
      parseAttachOptions({ nodeIp: '1.2.3.4', name: 'home-1', timeout: '0' }),
    ).toThrow('--timeout');
  });

  it("reads the machine's Talos version (maintenance mode)", () => {
    const out = [
      'node: ',
      'metadata:',
      '    namespace: runtime',
      '    type: Versions.runtime.talos.dev',
      '    id: version',
      '    version: 1',
      'spec:',
      '    version: v1.12.7',
    ].join('\n');
    expect(serverTalosVersion(out)).toBe('v1.12.7');
    expect(serverTalosVersion('metadata:\n    version: 1')).toBeUndefined();
  });

  it('shows a machine and a Hetzner node as table rows, and how to reset', () => {
    const base = {
      status: 'ready',
      reserved: false,
      cordoned: false,
      recorded: true,
    };
    expect(
      nodeRow({
        ...base,
        name: 'home-1',
        pool: 'home',
        cordoned: true,
        internalIp: '192.168.1.50',
        cpuCores: 8,
        memoryGb: 31.2,
        osImage: 'Talos (v1.12.7)',
        joinedAt: '2026-10-29T20:00:00Z',
        recorded: false,
        source: 'own',
        role: 'worker',
      }),
    ).toMatchObject({
      node: 'home-1',
      role: 'worker',
      source: 'own',
      status: 'ready, paused',
      use: 'capacity',
      note: 'joined by hand',
    });
    const cloud = nodeRow({
      ...base,
      name: 'demo-cp-1',
      source: 'hetzner',
      role: 'control-plane',
    });
    expect(cloud).toMatchObject({
      node: 'demo-cp-1',
      role: 'control plane',
      source: 'hetzner',
      pool: '-',
      use: '-',
    });
    expect(cloud).not.toHaveProperty('note');
    expect(resetHint('c1', 'home-1', '192.168.1.50')).toBe(
      'gcli cluster:reset-machine --cluster c1 --name home-1 --node-ip 192.168.1.50',
    );
  });
});
