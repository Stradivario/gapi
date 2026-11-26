import { Command } from 'commander';

import { lazy } from '~/helpers';

/** Plan 50 - cost optimization: right-sizing, hibernation, savings, pod
    placement, plugin volume auto-grow. */
export function registerCostCommands(program: Command) {
  program
    .command('lambda:resources')
    .description(
      'What each lambda really uses next to what it reserves, and the right-sized CPU / memory (raise / lower / keep, cost now vs recommended); --auto keeps one sized automatically',
    )
    .option('-p, --project <project>')
    .option('-n, --name <name>', 'One lambda')
    .option('--days <days>', 'Measurement window, 1-8 days (default 7)')
    .option(
      '--auto',
      'With --name: the platform applies the recommendation itself (a day of data, within the plan, at most once a day, you are notified)',
    )
    .option('--fixed', 'With --name: recommendations only (the default)')
    .option('--json', 'Print the rows as JSON')
    .action(lazy(() => import('./lambda-resources').then((m) => m.default)));

  program
    .command('plugin:resources')
    .description(
      'What each installed plugin (Redis, MongoDB, NATS, ...) really uses per instance, and the right-sized CPU / memory; --apply sets it',
    )
    .option('-p, --project <project>')
    .option('-n, --name <name>', 'One plugin, e.g. redis-plugin')
    .option('--days <days>', 'Measurement window, 1-8 days (default 7)')
    .option(
      '--apply',
      'With --name: reserve the recommended CPU / memory (limits kept; instances restart one at a time)',
    )
    .option('--json', 'Print the rows as JSON')
    .action(lazy(() => import('./plugin-resources').then((m) => m.default)));

  program
    .command('plugin:auto-grow')
    .arguments('<plugin>')
    .description(
      "Whether the plugin's volume grows to the next size by itself at 90 % full (on by default) or only warns",
    )
    .option('-p, --project <project>')
    .option('--on', 'Grow by itself')
    .option('--off', 'Only warn at 80 % / 90 %')
    .option(
      '-cid, --clusterId <clusterId>',
      'Which installation, when the plugin is on several clusters (omit for the shared cluster)',
    )
    .action(lazy(() => import('./plugin-resources').then((m) => m.autoGrow)));

  program
    .command('project:hibernation')
    .description(
      'Show or set when the project sleeps: outside its working hours always-on lambdas scale to 0 (plugins keep running). Off by default',
    )
    .option('-p, --project <project>')
    .option('--enable', 'Turn hibernation on')
    .option('--disable', 'Turn it off (wakes the project)')
    .option('--timezone <tz>', 'IANA time zone, e.g. Europe/Sofia')
    .option(
      '--days <days>',
      'Working days: mon-fri, 1-5, sat,sun ... (0 = Sunday)',
    )
    .option('--wake <HH:MM>', 'Working hours start')
    .option('--sleep <HH:MM>', 'Working hours end')
    .option('--json', 'Print as JSON')
    .action(lazy(() => import('./hibernation').then((m) => m.default)));

  program
    .command('project:sleep')
    .description('Put the project to sleep now, until its next wake time')
    .option('-p, --project <project>')
    .option('--json', 'Print as JSON')
    .action(lazy(() => import('./hibernation').then((m) => m.sleepNow)));

  program
    .command('project:wake')
    .description('Wake the project now, until its next sleep time')
    .option('-p, --project <project>')
    .option('--json', 'Print as JSON')
    .action(lazy(() => import('./hibernation').then((m) => m.wakeNow)));

  program
    .command('project:savings')
    .description(
      'What the platform saved this month: fewer / cheaper machines, hours asleep, lambdas sized down automatically',
    )
    .option('-p, --project <project>')
    .option('--json', 'Print as JSON')
    .action(lazy(() => import('./savings').then((m) => m.default)));

  program
    .command('cluster:pod-placement')
    .description(
      "How a Talos cluster's scheduler places new pods: spread (emptiest machine) or fill (pack machines, so the autoscaler can remove empty ones). Changed live, no reboot",
    )
    .option('-p, --project <project>')
    .option('-c, --cluster <cluster>', 'Cluster id (see cluster:list)')
    .option('--clusterName <clusterName>', 'Cluster name instead of --cluster')
    .option('--mode <mode>', 'spread | fill')
    .action(lazy(() => import('./pod-placement').then((m) => m.default)));
}
