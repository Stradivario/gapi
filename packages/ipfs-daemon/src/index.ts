import {
  BootstrapLogger,
  Container,
  ExitHandlerService,
  Module,
  ModuleWithServices,
} from '@rxdi/core';
import IPFSFactory = require('ipfsd-ctl');
import {
  initIpfsDaemonOptions,
  IPFS_DAEMON,
  Options,
} from './ipfs-daemon-injection';
import { IpfsDaemonInfoService } from './ipfs-daemon-node-info';
import { PingService } from './services';

@Module()
export class IpfsDaemonModule {
  public static forRoot(options: Options = new Options()): ModuleWithServices {
    return {
      module: IpfsDaemonModule,
      services: [
        PingService,
        {
          provide: IPFS_DAEMON,
          lazy: true,
          useFactory: async () => {
            return await new Promise((resolve) => {
              const infoService = Container.get(IpfsDaemonInfoService);
              const logger = Container.get(BootstrapLogger);
              const exitHandler = Container.get(ExitHandlerService);
              console.log(options.config);
              IPFSFactory.create({
                remote: options.remote,
                port: options.port,
                type: options.type,
              }).spawn(
                { config: options.config } || initIpfsDaemonOptions,
                (err, ipfsd) => {
                  if (err) {
                    throw err;
                  }
                  exitHandler.onExitApp(['SIGTERM']).subscribe(() => {
                    ipfsd.stop();
                    ipfsd.killProcess();
                  });
                  ipfsd.api.id(function (e, id) {
                    if (e) {
                      throw e;
                    }
                    logger.log(id);
                    logger.log(
                      `Ipfs daemon api running at: ${ipfsd.api.gatewayHost}:${ipfsd.api.apiPort}`
                    );
                    logger.log(
                      `Ipfs daemon gateway running at: ${ipfsd.api.gatewayHost}:${ipfsd.api.gatewayPort}`
                    );
                    infoService.setInfo({
                      apiHost: ipfsd.api.apiHost,
                      apiPort: ipfsd.api.apiPort,
                      gatewayHost: ipfsd.api.gatewayHost,
                      gatewayPort: ipfsd.api.gatewayPort,
                    });
                    resolve(ipfsd);
                  });
                }
              );
            });
          },
        },
      ],
    };
  }
}

export * from './ipfs-daemon-injection';
export * from './ipfs-daemon-node-info';
export * from './services/index';
