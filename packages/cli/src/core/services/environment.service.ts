import { Service } from '@rxdi/core';

@Service()
export class EnvironmentVariableService {
  setVariables(config) {
    let buildedEnvironments = ``;
    const conf = Object.keys(config);
    let count = 0;
    conf.forEach(key => {
      count++;
      if (conf.length === count) {
        buildedEnvironments += `export ${key}=${config[key]}`;
      } else {
        buildedEnvironments += `export ${key}=${config[key]} && `;
      }
    });
    return buildedEnvironments;
  }
}
