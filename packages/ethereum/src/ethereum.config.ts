/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from '@rxdi/core';

@Service()
export class EthereumConfig {
  rpc = 'http://localhost';
  port: number | string = 8545;
  contracts?: Array<{ contract: any; abi: any }>;
}
