## 2026-11-21 - domains-yaml: domains: in lambforge.yaml, domain:apply and domain:list

**Feature:** domains-yaml · **Type:** feat

- `domains:` section (platform names, custom domains, `serves`, `paths`)
  applied by the new `gcli domain:apply` and after every
  `lambda:create` / `lambda:update` (best effort); `gcli domain:list`.
  Claims / adds what is missing, routes what differs, never removes.
- **Test:** `npx jest test/domains-yaml`.
- **Debug:** `docs/features/domains-yaml.md`.
- **Verification:** 6 specs + full suite (226) green; live against
  production: `domain:list` showed pav.lambforge.app with its path rule,
  `domain:apply` with a matching file reported it up to date.
