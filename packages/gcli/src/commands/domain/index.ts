import { Command } from 'commander';

import { lazy } from '~/helpers';

/** Domains of a project (feature customer-domains): platform names
    (acme.lambforge.app), custom domains, path rules. */
export function registerDomainCommands(program: Command) {
  program
    .command('domain:list')
    .description('List the domains and platform names of a project')
    .option('-p, --project <project>')
    .action(lazy(() => import('./list').then((m) => m.default)));

  program
    .command('domain:apply')
    .description(
      'Claim, add and route the domains listed under domains: in lambforge.yaml',
    )
    .option('-p, --project <project>')
    .option('-spec, --spec <spec>')
    .action(lazy(() => import('./apply').then((m) => m.default)));
}
