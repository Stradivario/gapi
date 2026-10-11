## 2026-10-11 - repo: Tests workflow runs lint and tests on every branch push

**Feature:** repo · **Type:** tooling

- New `.github/workflows/tests.yml` at the gapi repo root ("Tests"): on
  every push to a non-master branch (skippable with `[ci-skip]`), Node 24,
  `npx @rxdi/bolt install`, `npm run lint`, `npm test` across all
  workspaces; dependencies cached by `yarn.lock` + package manifests. Same
  shape as graphql-server's Tests / graphql-server-lambdas' Specs. Before,
  lint/test only ran in Publish - after the merge to master.
- **Test:** push a branch -> the "Tests" check appears on the PR. Locally,
  from the gapi root: `npm run lint && npm test`.
- **Debug:** a red Tests run names the workspace in its log prefix
  (`(@gapi/gcli) $ npm test ...`); reproduce with the same root command or
  `npm test` inside that package.
- **Verification:** locally from the root: lint exit 0 (all 14 eslint
  workspaces), tests exit 0 (@gapi/ac 1/1, @gapi/cli-builder 1/1,
  @gapi/gcli 27/27); workflow YAML parsed with js-yaml.
