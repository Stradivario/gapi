import { Command } from 'commander';

import { lazy } from '~/helpers';

export function registerClusterCommands(program: Command) {
  program
    .command('cluster:create')
    .description(
      'Provision a private Talos cluster for a project (runs in the background - takes several minutes; use --wait to block)',
    )
    .option('-p, --project <project>')
    .option('-spec, --spec <spec>')
    .option('-n, --name <name>')
    .option('--imageId <imageId>', 'hcloud Talos snapshot id')
    .option('--serverType <serverType>')
    .option('-l, --location <location>')
    .option('--workers <workers>', 'Worker count (ignored when --singleNode)')
    .option('--singleNode', 'Control plane carries the workload too')
    .option('--wait', 'Block until the cluster is ready (or errors)')
    .action(lazy(() => import('./create').then((m) => m.default)));

  program
    .command('cluster:list')
    .description(
      'List every private cluster this project has (it may have several - dev/stage/prod, ...)',
    )
    .option('-p, --project <project>')
    .action(lazy(() => import('./list').then((m) => m.default)));

  program
    .command('cluster:teardown')
    .description(
      "Tear down one of a project's clusters (runs in the background - use --wait to block)",
    )
    .option('-p, --project <project>')
    .option('-c, --cluster <cluster>', 'Cluster id (see cluster:list)')
    .option('--wait', 'Block until the cluster is gone (or errors)')
    .action(lazy(() => import('./teardown').then((m) => m.default)));

  program
    .command('cluster:kubeconfig')
    .description(
      "Print (or save) a cluster's raw kubeconfig YAML - only available once it's 'ready'",
    )
    .option('-p, --project <project>')
    .option('-c, --cluster <cluster>', 'Cluster id (see cluster:list)')
    .option('-o, --output <output>', 'Write to this file instead of stdout')
    .action(lazy(() => import('./kubeconfig').then((m) => m.default)));
}
