/**
 * talosctl for gcli (feature self-managed-nodes): used by cluster:attach and
 * cluster:reset-machine, never needed by the other commands. A talosctl on
 * PATH is used when its version matches the cluster; otherwise the matching
 * release is downloaded once from Sidero's GitHub releases, checked against
 * the release's sha256sum.txt and cached in ~/.graphql-server/bin. The pure
 * helpers are unit-tested in test/talosctl.spec.ts.
 */
import { execFile } from 'child_process';
import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { chmod, mkdir, rename, writeFile } from 'fs/promises';
import { join } from 'path';

import { Logger } from '~/services/log';
import { mainDirectory } from '~/types';

const RELEASES = 'https://github.com/siderolabs/talos/releases/download';
const VERSION_RE = /^v\d+\.\d+\.\d+$/;

export interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** The release asset for this computer, e.g. talosctl-linux-amd64. */
export function talosctlAssetName(
  platform: string = process.platform,
  arch: string = process.arch,
): string {
  const os =
    platform === 'win32'
      ? 'windows'
      : platform === 'darwin'
        ? 'darwin'
        : platform === 'linux'
          ? 'linux'
          : null;
  const cpu = arch === 'x64' ? 'amd64' : arch === 'arm64' ? 'arm64' : null;
  if (!os || !cpu) {
    throw new Error(
      `No talosctl release for ${platform}/${arch}. Install talosctl yourself: https://www.talos.dev/latest/talos-guides/install/talosctl/`,
    );
  }
  return `talosctl-${os}-${cpu}${os === 'windows' ? '.exe' : ''}`;
}

/** The sha256 of `asset` from a release's sha256sum.txt (`<hex>  <name>`). */
export function checksumFor(sums: string, asset: string): string | null {
  for (const line of sums.split('\n')) {
    const [hash, name] = line.trim().split(/\s+\*?/);
    if (name === asset && /^[a-f0-9]{64}$/i.test(hash ?? '')) {
      return hash.toLowerCase();
    }
  }
  return null;
}

/** The client version from `talosctl version --client --short`. */
export const clientVersionOf = (output: string): string | null =>
  output.match(/Talos (v\d+\.\d+\.\d+\S*)/)?.[1] ?? null;

export const runBinary = (
  binary: string,
  args: string[],
  timeoutMs = 20_000,
): Promise<CommandResult> =>
  new Promise((resolve) =>
    execFile(
      binary,
      args,
      { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) =>
        resolve({
          code: error ? ((error as { code?: number }).code ?? 1) : 0,
          stdout: String(stdout),
          stderr: String(stderr),
        }),
    ),
  );

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * The path of a talosctl of `version` (e.g. v1.12.7): the one on PATH when
 * it is that version, else the cached download, else it downloads it
 * (~90 MB, once) and verifies the checksum before it is ever run.
 */
export async function ensureTalosctl(version: string): Promise<string> {
  if (!VERSION_RE.test(version)) {
    throw new Error(`Unknown Talos version "${version}"`);
  }
  const onPath = await runBinary('talosctl', [
    'version',
    '--client',
    '--short',
  ]);
  if (onPath.code === 0 && clientVersionOf(onPath.stdout) === version) {
    return 'talosctl';
  }
  const asset = talosctlAssetName();
  const dir = join(mainDirectory, 'bin');
  const binary = join(
    dir,
    `talosctl-${version}${asset.endsWith('.exe') ? '.exe' : ''}`,
  );
  if (existsSync(binary)) {
    return binary;
  }
  Logger.info(
    `Downloading talosctl ${version} (${asset}, about 90 MB, once) from the Talos releases ...`,
  );
  const sums = (
    await download(`${RELEASES}/${version}/sha256sum.txt`)
  ).toString('utf8');
  const expected = checksumFor(sums, asset);
  if (!expected) {
    throw new Error(`The ${version} release lists no checksum for ${asset}.`);
  }
  const body = await download(`${RELEASES}/${version}/${asset}`);
  const actual = createHash('sha256').update(body).digest('hex');
  if (actual !== expected) {
    throw new Error(
      `Checksum mismatch for ${asset} ${version} - the download was not used.`,
    );
  }
  await mkdir(dir, { recursive: true });
  const partial = `${binary}.partial`;
  await writeFile(partial, body, { mode: 0o755 });
  await chmod(partial, 0o755);
  await rename(partial, binary);
  Logger.info(`talosctl ${version} saved to ${binary}`);
  return binary;
}
