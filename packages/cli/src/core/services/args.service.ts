import { Service } from '@rxdi/core';

@Service()
export class ArgsService {
  args: string[];

  setArguments(args: string[]) {
    this.args = args;
  }
}
