type Commands =
  | '--wss'
  | '--secret'
  | '--port'
  | '--label'
  | '--random-port'
  | '--runner-type'
  | '--send-response-to-server'
  | '--systemctl'
  | '--systemctl-name'
  | '--systemctl-description'
  | '--systemctl-executable'
  | '--graphiql';

export const includes = (i: Commands) =>
  process.argv.toString().includes(i);
export const nextOrDefault = (
  i: Commands,
  fb: unknown = true,
  type = (p) => p
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
  GRAPHQL_RUNNER_SUBSCRIPTION_URI:
    process.env.GRAPHQL_RUNNER_SUBSCRIPTION_URI ||
    nextOrDefault('--wss', ''),
  GRAPHQL_RUNNER_SECRET:
    process.env.GRAPHQL_RUNNER_SECRET ||
    nextOrDefault('--secret', ''),
  GRAPHQL_RUNNER_API_PORT:
    process.env.GRAPHQL_RUNNER_API_PORT ||
    nextOrDefault('--port', '42043'),
  GRAPHQL_SYSTEM_SERVICE:
    process.env.GRAPHQL_SYSTEM_SERVICE ||
    nextOrDefault('--systemctl', false),
  GRAPHQL_SYSTEM_SERVICE_NAME:
    process.env.GRAPHQL_SYSTEM_SERVICE_NAME ||
    nextOrDefault('--systemctl-name', false),
  GRAPHQL_SYSTEM_SERVICE_DESCRIPTION:
    process.env.GRAPHQL_SYSTEM_SERVICE_DESCRIPTION ||
    nextOrDefault('--systemctl-description', false),
  GRAPHQL_SYSTEM_SERVICE_EXECUTABLE:
    process.env.GRAPHQL_SYSTEM_SERVICE_EXECUTABLE ||
    nextOrDefault('--systemctl-executable', ''),
  GRAPHQL_RUNNER_RANDOM_PORT:
    process.env.GRAPHQL_RUNNER_RANDOM_PORT ||
    includes('--random-port'),
  GRAPHQL_RUNNER_GRAPHIQL:
    true ||
    process.env.GRAPHQL_RUNNER_GRAPHIQL ||
    includes('--graphiql'),
  GRAPHQL_RUNNER_TYPE:
    process.env.GRAPHQL_RUNNER_TYPE ||
    nextOrDefault('--runner-type'),
  GRAPHQL_RUNNER_LABEL:
    process.env.GRAPHQL_RUNNER_LABEL ||
    nextOrDefault('--label', ''),
  GRAPHQL_RUNNER_SEND_RETURN_RESPONSE:
    process.env.GRAPHQL_RUNNER_SEND_RETURN_RESPONSE ||
    includes('--send-response-to-server'),
};
