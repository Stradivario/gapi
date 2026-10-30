import {
  checksumFor,
  clientVersionOf,
  talosctlAssetName,
} from '../src/commands/cluster/helpers/talosctl';
import { hostnameOf } from '../src/commands/cluster/reset-machine';

describe('[talosctl helpers] (self-managed-nodes)', () => {
  it('picks the release asset for this computer', () => {
    expect(talosctlAssetName('linux', 'x64')).toBe('talosctl-linux-amd64');
    expect(talosctlAssetName('darwin', 'arm64')).toBe('talosctl-darwin-arm64');
    expect(talosctlAssetName('win32', 'x64')).toBe(
      'talosctl-windows-amd64.exe',
    );
    expect(() => talosctlAssetName('aix', 'x64')).toThrow(
      'No talosctl release',
    );
    expect(() => talosctlAssetName('linux', 'ia32')).toThrow(
      'No talosctl release',
    );
  });

  it('reads the checksum of one asset from sha256sum.txt', () => {
    const hash = 'a'.repeat(64);
    const sums = [
      `${'b'.repeat(64)}  talosctl-darwin-amd64`,
      `${hash}  talosctl-linux-amd64`,
      `${'c'.repeat(64)} *talosctl-windows-amd64.exe`,
    ].join('\n');
    expect(checksumFor(sums, 'talosctl-linux-amd64')).toBe(hash);
    expect(checksumFor(sums, 'talosctl-windows-amd64.exe')).toBe(
      'c'.repeat(64),
    );
    expect(checksumFor(sums, 'talosctl-linux-arm64')).toBeNull();
    expect(
      checksumFor('zzz  talosctl-linux-amd64', 'talosctl-linux-amd64'),
    ).toBeNull();
  });

  it('reads the client version and a machine hostname', () => {
    expect(clientVersionOf('Client:\n\tTalos v1.12.7\n')).toBe('v1.12.7');
    expect(clientVersionOf('command not found')).toBeNull();
    expect(
      hostnameOf(
        'node: 192.168.1.205\nmetadata:\n    id: hostname\nspec:\n    hostname: home-1\n    domainname: ""\n',
      ),
    ).toBe('home-1');
    expect(hostnameOf('spec: {}')).toBeNull();
  });
});
