import { Container, createTestBed } from '@rxdi/core';
import { <%= classify(name) %>Component } from './<%= name %>.component';


describe('<%= classify(name) %>Component', () => {
  beforeAll(async () => {
    await createTestBed({
      components: [<%= classify(name) %>Component]
    }).toPromise();
  });

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should be defined', done => {
    expect(Container.has(<%= classify(name) %>Component)).toBeTruthy();
    done();
  });

  it('displays greeting', () => {
    const element = Container.get(<%= classify(name) %>Component);
    element['render']();
    document.body.appendChild(element);
    const div = document.querySelector('<%= dasherize(name) %>-component');
    expect(div.textContent).toBe('');
  });
});
