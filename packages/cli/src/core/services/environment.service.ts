import { Service } from '@rxdi/core';

import { isWindows } from '../helpers';

@Service()
export class EnvironmentVariableService {
  setVariables(config) {
    let buildedEnvironments = ``;
    const conf = Object.keys(config);
    let count = 0;
    conf.forEach((key) => {
      count++;
      if (conf.length === count) {
        buildedEnvironments += `${isWindows() ? 'set' : 'export'} ${key}=${
          config[key]
        }`;
      } else {
        buildedEnvironments += `${isWindows() ? 'set' : 'export'} ${key}=${
          config[key]
        } && `;
      }
    });
    return buildedEnvironments;
  }
}
