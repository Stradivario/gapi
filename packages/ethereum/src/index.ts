import { Module, ModuleWithServices } from '@rxdi/core';

import { EthereumConfig } from './ethereum.config';
import { getContractAddress } from './helpers';
import { Web3ProviderToken, Web3Token } from './web3.injection';
import Web3 = require('web3');

@Module({
  services: [EthereumConfig],
})
export class EthereumModule {
  public static forRoot(config: EthereumConfig): ModuleWithServices {
    const UserAddedContracts = [];
    if (config.contracts && config.contracts.length) {
      config.contracts.forEach((i) =>
        UserAddedContracts.push({
          provide: i.contract,
          deps: [Web3Token],
          lazy: true,
          useFactory: async (web3: Web3) =>
            await i.contract.createAndValidate(web3, getContractAddress(i.abi)),
        })
      );
    }
    return {
      module: EthereumModule,
      services: [
        {
          provide: EthereumConfig,
          useValue: config || new EthereumConfig(),
        },
        {
          provide: Web3Token,
          useValue: new Web3(null),
        },
        {
          provide: Web3ProviderToken,
          deps: [Web3Token],
          useFactory: (web3: Web3) => {
            const provider = new web3.providers.HttpProvider(
              `${config.rpc}:${config.port}`
            );
            web3.setProvider(provider);
            return provider;
          },
        },
        ...UserAddedContracts,
      ],
    };
  }
}

export * from './ethereum.config';
export * from './web3.injection';
export * from './web3.typings';
export * from './helpers';
