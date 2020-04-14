import 'jest';
import { Container, createTestBed } from '@gapi/core';
import { <%= classify(name) %> } from './<%= name %>';

describe('<%= classify(name) %> Injectable', () => {
  beforeAll(async () => {
    await createTestBed({
      imports: [],
      providers: [<%= classify(name) %>]
    }).toPromise();
  });

  it('should be defined', done => {
    expect(Container.has(<%= classify(name) %>)).toBeTruthy();
    done();
  });
});
