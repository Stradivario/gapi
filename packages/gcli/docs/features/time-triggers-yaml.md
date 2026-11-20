# Time triggers from lambforge.yaml

`gcli lambda:create` and `gcli lambda:update` apply the `triggers.time`
block of lambforge.yaml after the lambda is saved
(`src/commands/lambda/helpers/time-trigger-sync.ts`):

```yaml
triggers:
  time:
    triggerName: every-10m
    cron: '*/10 * * * *'
```

| The lambda has | Result |
|---|---|
| no time trigger | created (`<lambda>-<triggerName>`) |
| one with the same name and cron | kept ("is up to date") |
| one with another name or cron | replaced (deleted, then created) - the platform allows ONE time trigger per lambda |
| (file has no `triggers.time`) | nothing - a deploy never deletes a trigger the file does not mention |

The stored name is `<lambda>-<triggerName>`; older triggers stored without
the prefix also count as the same name. A failure is printed
("triggers.time was not applied: ... - run gcli cron:create") and never
fails the deploy. `gcli cron:create` / `cron:delete` still work by hand.

- **Test:** `npx jest test/time-trigger-yaml.spec.ts`.
- **Debug:** the deploy prints `Time trigger <name> (<cron>) created /
  is up to date / replaced by ...`; compare with `gcli cron:list`.
- **History:** until 1.8.277 the block was ignored (found 2026-11-19 -
  `workspace-gc` declared `@weekly` and never had a trigger).
