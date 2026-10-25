import { Command } from 'commander';

import { lazy } from '~/helpers';

/* Feature workflows: Fission durable workflows (graphql-server-lambdas) and
 * their AI drafts (graphql-server). Workflows are addressed by --name. */
export function registerWorkflowCommands(program: Command) {
  program
    .command('workflow:list')
    .description('List the project workflows')
    .option('-p, --project <project>')
    .action(lazy(() => import('./list').then((m) => m.default)));

  program
    .command('workflow:get')
    .description(
      'Print a workflow as YAML (the format workflow:apply reads), or write it with -o',
    )
    .option('-p, --project <project>')
    .option('-n, --name <name>', 'Workflow name')
    .option('-o, --out <file>', 'Write the YAML to this file')
    .action(lazy(() => import('./get').then((m) => m.default)));

  program
    .command('workflow:generate')
    .description(
      'Draft a workflow with AI from plain language (or change one with --name / --from). Prints or writes YAML; saves only with --apply',
    )
    .option('-p, --project <project>')
    .option(
      '-d, --description <text>',
      'What the workflow should do, e.g. "charge the card with retries, then email the receipt"',
    )
    .option(
      '-n, --name <name>',
      'Workflow name: an existing one is changed, a new one is named so',
    )
    .option('--from <file>', 'Change this workflow file instead')
    .option('-o, --out <file>', 'Write the draft YAML to this file')
    .option('--apply', 'Save the draft as the workflow (needs a name)')
    .action(lazy(() => import('./generate').then((m) => m.default)));

  program
    .command('workflow:apply')
    .description(
      'Create or update a workflow from a YAML/JSON file (workflow: {name, description, definition})',
    )
    .option('-p, --project <project>')
    .option('-f, --file <file>', 'Workflow file')
    .option('-n, --name <name>', 'Overrides workflow.name from the file')
    .option('-d, --description <text>', 'Overrides workflow.description')
    .action(lazy(() => import('./apply').then((m) => m.default)));

  program
    .command('workflow:validate')
    .description(
      'Check a workflow file against the cluster (lambdas exist, graph is valid)',
    )
    .option('-p, --project <project>')
    .option('-f, --file <file>', 'Workflow file')
    .action(lazy(() => import('./validate').then((m) => m.default)));

  program
    .command('workflow:delete')
    .description('Delete a workflow and all of its runs')
    .option('-p, --project <project>')
    .option('-n, --name <name>', 'Workflow name')
    .action(lazy(() => import('./delete').then((m) => m.default)));

  program
    .command('workflow:run')
    .description(
      'Start a run; the JSON input is the first step request body. --wait follows it to the end',
    )
    .option('-p, --project <project>')
    .option('-n, --name <name>', 'Workflow name')
    .option('-i, --input <json>', 'Run input as JSON (default {})')
    .option('--input-file <file>', 'Read the run input from a JSON file')
    .option('-w, --wait', 'Print each step as it happens until the run ends')
    .action(lazy(() => import('./run').then((m) => m.default)));

  program
    .command('workflow:runs')
    .description('List a workflow runs, newest first')
    .option('-p, --project <project>')
    .option('-n, --name <name>', 'Workflow name')
    .option('-l, --limit <limit>', 'How many (default 50)')
    .action(lazy(() => import('./runs').then((m) => m.default)));

  program
    .command('workflow:status')
    .description(
      'Show a run: its step events, error and output (--follow until it ends)',
    )
    .option('-p, --project <project>')
    .option('-n, --name <name>', 'Workflow name')
    .option('-r, --run <run>', 'Run name (see workflow:runs)')
    .option('-f, --follow', 'Keep printing events until the run ends')
    .action(lazy(() => import('./status').then((m) => m.default)));

  program
    .command('workflow:cancel')
    .description('Cancel a running run')
    .option('-p, --project <project>')
    .option('-n, --name <name>', 'Workflow name')
    .option('-r, --run <run>', 'Run name (see workflow:runs)')
    .action(lazy(() => import('./cancel').then((m) => m.default)));
}
