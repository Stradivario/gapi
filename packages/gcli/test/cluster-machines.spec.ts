import 'jest';

import {
  attachHint,
  planMachines,
  storageCell,
  validateMachines,
} from '../src/commands/cluster/helpers/machines';
import { validateDesired } from '../src/commands/cluster/helpers/plan';
import { ClusterNode } from '../src/commands/cluster/types';

const node = (
  name: string,
  storage = 'off',
  extra: Partial<ClusterNode> = {},
) =>
  ({
    name,
    reserved: false,
    status: 'ready',
    cordoned: false,
    recorded: true,
    source: 'own',
    storage,
    ...extra,
  }) as ClusterNode;

describe('[cluster machines] (node-storage)', () => {
  it('validates the machines list of a cluster spec', () => {
    expect(validateMachines(undefined)).toEqual([]);
    expect(validateMachines({})).toEqual(['cluster.machines must be a list']);
    expect(
      validateMachines([
        { name: 'home-1', storage: true },
        { name: 'Home 2' },
        { name: 'home-1' },
        { name: 'home-3', storage: 'yes' },
      ]),
    ).toEqual([
      "cluster.machines[1].name must be the machine's name (lowercase, digits, dashes)",
      'cluster.machines[2].name "home-1" is listed twice',
      'cluster.machines[3].storage must be true or false',
    ]);
    expect(
      validateDesired({ name: 'c', machines: [{ name: 'Bad' }] }),
    ).toHaveLength(1);
    expect(
      validateDesired({
        name: 'v',
        provider: 'vcluster',
        machines: [{ name: 'home-1' }],
      }),
    ).toEqual(['cluster.machines does not apply to a virtual cluster']);
  });

  it('turns storage on only where it is asked for and missing', () => {
    const { steps, notes } = planMachines(
      [
        { name: 'home-1', storage: true },
        { name: 'home-2', storage: true },
        { name: 'home-3' },
        { name: 'home-4', storage: true },
      ],
      [
        node('home-1'),
        node('home-2', 'ready'),
        node('home-3'),
        node('home-4', 'preparing'),
        node('home-5'),
      ],
    );
    expect(steps).toEqual([
      expect.objectContaining({ name: 'home-1', enabled: true }),
    ]);
    expect(notes).toEqual(['machine "home-4": storage is being prepared']);
  });

  it('retries a failed machine and needs --yes to turn storage off', () => {
    const { steps } = planMachines(
      [
        { name: 'home-1', storage: true },
        { name: 'home-2', storage: false },
      ],
      [node('home-1', 'failed'), node('home-2', 'ready')],
    );
    expect(steps[0].description).toContain('retry');
    expect(steps[1]).toMatchObject({
      name: 'home-2',
      enabled: false,
      destructive: true,
    });
  });

  it('never attaches: a machine that is not there becomes a note with the command', () => {
    const { steps, notes } = planMachines(
      [{ name: 'home-9', storage: true, pool: 'home', reserved: true }],
      [node('home-9', 'off', { source: 'hetzner' })],
      'abc',
    );
    expect(steps).toEqual([]);
    expect(notes[0]).toContain(
      'gcli cluster:attach --cluster abc --name home-9 --node-ip <ip> --disk <disk> --pool home --reserved --storage',
    );
    expect(attachHint({ name: 'home-1' })).toBe(
      'gcli cluster:attach --cluster <cluster-id> --name home-1 --node-ip <ip> --disk <disk>',
    );
  });

  it('shows storage in cluster:nodes', () => {
    expect(storageCell(node('a'))).toBe('-');
    expect(storageCell(node('a', 'ready'))).toBe('yes');
    expect(
      storageCell(node('a', 'preparing', { storageMessage: 'installing' })),
    ).toBe('preparing: installing');
    expect(storageCell(node('a', 'ready', { source: 'hetzner' }))).toBe('-');
  });
});
