import 'jest';
import { Container, createTestBed } from '@gapi/core';
import { <%= classify(name) %>Effect } from './<%= name %>.effect';

describe('<%= classify(name) %> Effect', () => {
  beforeAll(async () => {
    await createTestBed({
      imports: [],
      effects: [<%= classify(name) %>Effect]
    }).toPromise();
  });

  it('should be defined', done => {
    expect(Container.has(<%= classify(name) %>Effect)).toBeTruthy();
    done();
  });
});
