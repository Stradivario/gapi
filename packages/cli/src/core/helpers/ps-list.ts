/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';
import { execFile } from 'child_process';
import { basename, join } from 'path';
import { promisify } from 'util';

const TEN_MEGABYTES = 1000 * 1000 * 10;
export interface Process {
  pid: number;
  name: string;
  cmd?: string;
  ppid: number;
  uid?: number;
  cpu?: number;
  memory?: number;
}

interface ReturnType {
  comm: {
    comm: string;
    args: string;
    ppid: string;
    uid: string;
  };
}

const windows = async (): Promise<Process[]> => {
  // Source: https://github.com/MarkTiedemann/fastlist
  const bin = join(__dirname, 'fastlist.exe');
  const { stdout } = await promisify(execFile)(bin, {
    maxBuffer: TEN_MEGABYTES,
  });
  return stdout
    .trim()
    .split('\r\n')
    .map((line) => line.split('\t'))
    .map(([name, pid, ppid]) => ({
      name,
      pid: Number.parseInt(pid, 10),
      ppid: Number.parseInt(ppid, 10),
    }));
};

const main = async (options = { all: null }): Promise<Process[]> => {
  const flags = (options.all === false ? '' : 'a') + 'wwxo';
  const ret: ReturnType = {} as any;

  await Promise.all(
    ['comm', 'args', 'ppid', 'uid', '%cpu', '%mem'].map(async (cmd) => {
      const { stdout } = await promisify(execFile)(
        'ps',
        [flags, `pid,${cmd}`],
        { maxBuffer: TEN_MEGABYTES }
      );

      for (let line of stdout.trim().split('\n').slice(1)) {
        line = line.trim();
        const [pid] = line.split(' ', 1);
        const val = line.slice(pid.length + 1).trim();

        if (ret[pid] === undefined) {
          ret[pid] = {};
        }

        ret[pid][cmd] = val;
      }
    })
  );

  // Filter out inconsistencies as there might be race
  // issues due to differences in `ps` between the spawns
  return Object.entries(ret)
    .filter(
      ([, value]) =>
        value.comm &&
        value.args &&
        value.ppid &&
        value.uid &&
        value['%cpu'] &&
        value['%mem']
    )
    .map(([key, value]) => ({
      pid: Number.parseInt(key, 10),
      name: basename(value.comm),
      cmd: value.args,
      ppid: Number.parseInt(value.ppid, 10),
      uid: Number.parseInt(value.uid, 10),
      cpu: Number.parseFloat(value['%cpu']),
      memory: Number.parseFloat(value['%mem']),
    }));
};

export const getProcessList = process.platform === 'win32' ? windows : main;
