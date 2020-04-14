import { Injectable } from '@rxdi/core';

@Injectable()
export class <%= classify(name) %>Pipe {
  transform(value: any) {
    return value;
  }
}
