import { <%= classify(name) %>Plugin } from './<%= name %>.plugin';

describe('<%= classify(name) %>Plugin', () => {
  it('should be defined', () => {
    expect(new <%= classify(name) %>Plugin()).toBeDefined();
  });
});
