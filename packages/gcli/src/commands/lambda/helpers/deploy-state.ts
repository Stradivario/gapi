export type DeployState = 'DEPLOYING' | 'LIVE' | 'FAILED';

/** Where the deploy is now: the package build (getLambdaBuildStatus), and
    - where the API has it - the lambda's deployStatus, which turns LIVE /
    FAILED only once the new version is rolled out (an update that needed
    a build answers DEPLOYING until then). Without deployStatus, "built" is
    taken as live. */
export const deployStateOf = (
  build: {
    ready?: boolean | null;
    failed?: boolean | null;
    status?: string | null;
  } | null,
  deployStatus: string | null | undefined,
): { state: DeployState; status?: string | null } => {
  if (build?.failed || deployStatus === 'FAILED') {
    return { state: 'FAILED', status: build?.status };
  }
  if (build?.ready && (!deployStatus || deployStatus === 'LIVE')) {
    return { state: 'LIVE', status: build.status };
  }
  return {
    state: 'DEPLOYING',
    status: build?.ready ? 'rolling out' : build?.status,
  };
};
