type Commands =
  | '--wss'
  | '--secret'
  | '--port'
  | '--random-port'
  | '--runner-type'
  | '--graphiql';

export const includes = (i: Commands) =>
  process.argv.toString().includes(i);
export const nextOrDefault = (
  i: Commands,
  fb: unknown = true,
  type = p => p
) => {
  if (process.argv.toString().includes(i)) {
    const isNextArgumentPresent =
      process.argv[process.argv.indexOf(i) + 1];
    if (!isNextArgumentPresent) {
      return fb;
    }
    if (isNextArgumentPresent.includes('--')) {
      return fb;
    }
    return type(isNextArgumentPresent);
  }
  return fb;
};

export const Environment = {
  SUBSCRIPTION_URI:
    process.env.GRAPHQL_RUNNER_SUBSCRIPTION_URI ||
    nextOrDefault('--wss', ''),
  AUTHORIZATION_TOKEN:
    process.env.GRAPHQL_RUNNER_SECRET ||
    nextOrDefault('--secret', ''),
  API_PORT:
    process.env.GRAPHQL_RUNNER_API_PORT ||
    nextOrDefault('--port', '42043'),
  RANDOM_PORT:
    process.env.GRAPHQL_RUNNER_RANDOM_PORT ||
    includes('--random-port'),
  GRAPHIQL:
    true ||
    process.env.GRAPHQL_RUNNER_GRAPHIQL ||
    includes('--graphiql'),
  WORKER_TYPE:
    process.env.GRAPHQL_RUNNER_WORKER_TYPE ||
    nextOrDefault('--runner-type', 'runner')
};