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
    .command('cluster:apply')
    .description(
      'Make a private cluster match the `cluster:` section of lambforge.yaml: creates it if missing, then applies topology, workers, control planes, load balancer and autoscaling',
    )
    .option('-p, --project <project>')
    .option(
      '-spec, --spec <spec>',
      'Spec file (default: lambforge.yaml / cluster.yaml)',
    )
    .option('--dry-run', 'Print the plan, change nothing')
    .option(
      '--yes',
      'Also apply steps that remove capacity or the load balancer IP',
    )
    .action(lazy(() => import('./apply').then((m) => m.default)));

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

  /* Scaling, topology, load balancer and health - the same operations as
     the dashboard's cluster page (cluster-provisioner). Mutations start a
     background job; --wait blocks until the cluster settles. */
  const target = (cmd: Command) =>
    cmd
      .option('-p, --project <project>')
      .option('-c, --cluster <cluster>', 'Cluster id (see cluster:list)')
      .option(
        '--clusterName <clusterName>',
        'Cluster name instead of --cluster',
      );

  target(
    program
      .command('cluster:status')
      .description(
        "Every cluster's status, agent, nodes, CPU/memory load, autoscaling and open issues (or one with --cluster)",
      ),
  ).action(lazy(() => import('./status').then((m) => m.default)));

  target(
    program
      .command('cluster:health')
      .description(
        "The latest health report of a cluster's agent, with every node",
      ),
  ).action(lazy(() => import('./health').then((m) => m.default)));

  target(
    program
      .command('cluster:scale-events')
      .description('Manual and autoscaler scale history, newest first'),
  )
    .option('--limit <limit>', 'How many events (default 20)')
    .action(lazy(() => import('./scale-events').then((m) => m.default)));

  program
    .command('cluster:cost')
    .description(
      "Month-to-date cost and the monthly estimate of the project's private clusters",
    )
    .option('-p, --project <project>')
    .action(lazy(() => import('./cost').then((m) => m.default)));

  target(
    program
      .command('cluster:scale')
      .description(
        'Set the number of worker nodes (1-10) of a multi-node cluster - billed per node-hour',
      ),
  )
    .option('--workers <workers>', 'Worker nodes, 1-10')
    .option('--wait', 'Block until the cluster settles')
    .action(lazy(() => import('./scale').then((m) => m.default)));

  target(
    program
      .command('cluster:scale:control-planes')
      .description('Set the number of control-plane nodes (1, 3 or 5)'),
  )
    .option('--count <count>', 'Control planes: 1, 3 or 5')
    .option('--wait', 'Block until the cluster settles')
    .action(
      lazy(() => import('./scale-control-planes').then((m) => m.default)),
    );

  target(
    program
      .command('cluster:autoscale')
      .description(
        'Change the worker autoscaling policy - only the flags you pass change',
      ),
  )
    .option('--enable', 'Turn autoscaling on (multi-node clusters only)')
    .option('--disable', 'Turn autoscaling off')
    .option('--min <min>', 'Minimum workers (1-10)')
    .option('--max <max>', 'Maximum workers (1-10)')
    .option('--cpuUp <percent>', 'Scale up at this CPU % (1-100)')
    .option('--memUp <percent>', 'Scale up at this memory % (1-100)')
    .option('--cpuDown <percent>', 'Scale down below this CPU % (1-100)')
    .option('--memDown <percent>', 'Scale down below this memory % (1-100)')
    .option('--samples <n>', 'Consecutive readings before acting (1-20)')
    .option('--cooldown <minutes>', 'Minutes between scale actions (1-1440)')
    .action(lazy(() => import('./autoscale').then((m) => m.default)));

  target(
    program
      .command('cluster:multi-node')
      .description(
        'Convert a single-node cluster to dedicated worker nodes (required for autoscaling)',
      ),
  )
    .option('--workers <workers>', 'Worker nodes, 1-10')
    .option('--wait', 'Block until the cluster settles')
    .action(lazy(() => import('./multi-node').then((m) => m.default)));

  target(
    program
      .command('cluster:single-node')
      .description(
        'Convert a multi-node cluster back to a single node (removes the worker nodes)',
      ),
  )
    .option('--wait', 'Block until the cluster settles')
    .action(lazy(() => import('./single-node').then((m) => m.default)));

  target(
    program
      .command('cluster:load-balancer')
      .description(
        "Add or remove the cluster's load balancer (billed per hour while enabled)",
      ),
  )
    .option('--enable', 'Add the load balancer')
    .option('--disable', 'Remove the load balancer')
    .option('--wait', 'Block until the cluster settles')
    .action(lazy(() => import('./load-balancer').then((m) => m.default)));
}
