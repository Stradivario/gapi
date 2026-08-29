import 'jest';

jest.mock('../src/services/gql-client', () => ({
  GraphqlClienAPI: {
    projectClusters: jest.fn(),
  },
}));

import { lastValueFrom, of } from 'rxjs';

import { resolveClusterId } from '../src/helpers';
import { GraphqlClienAPI } from '../src/services/gql-client';

describe('[resolveClusterId]', () => {
  const projectId = 'proj-1';

  beforeEach(() => {
    (GraphqlClienAPI.projectClusters as jest.Mock).mockReset();
  });

  it('returns the explicit clusterId directly without looking anything up', async () => {
    const result = await lastValueFrom(
      resolveClusterId(projectId, {
        clusterId: 'cluster-a-id',
        clusterName: 'some-other-name',
      }),
    );

    expect(result).toBe('cluster-a-id');
    expect(GraphqlClienAPI.projectClusters).not.toHaveBeenCalled();
  });

  it('passes an explicit empty-string clusterId through unchanged (some commands use it to mean "shared only")', async () => {
    const result = await lastValueFrom(
      resolveClusterId(projectId, { clusterId: '' }),
    );

    expect(result).toBe('');
    expect(GraphqlClienAPI.projectClusters).not.toHaveBeenCalled();
  });

  it("resolves clusterName to the matching cluster's id when no clusterId is given", async () => {
    (GraphqlClienAPI.projectClusters as jest.Mock).mockReturnValue(
      of([
        { id: 'cluster-a-id', name: 'Cluster A' },
        { id: 'cluster-b-id', name: 'Cluster B' },
      ]),
    );

    const result = await lastValueFrom(
      resolveClusterId(projectId, { clusterName: 'Cluster B' }),
    );

    expect(result).toBe('cluster-b-id');
    expect(GraphqlClienAPI.projectClusters).toHaveBeenCalledWith(projectId);
  });

  it('throws a helpful error when clusterName matches no cluster in the project', async () => {
    (GraphqlClienAPI.projectClusters as jest.Mock).mockReturnValue(
      of([{ id: 'cluster-a-id', name: 'Cluster A' }]),
    );

    await expect(
      lastValueFrom(
        resolveClusterId(projectId, { clusterName: 'Nonexistent Cluster' }),
      ),
    ).rejects.toMatch(/No cluster named "Nonexistent Cluster"/);
  });

  it('resolves to undefined (no hint) when neither clusterId nor clusterName is given', async () => {
    const result = await lastValueFrom(resolveClusterId(projectId, {}));

    expect(result).toBeUndefined();
    expect(GraphqlClienAPI.projectClusters).not.toHaveBeenCalled();
  });
});
