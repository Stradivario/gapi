import {
  html,
  Component,
  async,
  LitElement,
  property,
  OnInit,
  OnDestroy,
  OnUpdate,
  queryAll
} from '@rxdi/lit-html';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteParams } from '@rxdi/router';

/**
 * @customElement '<%= dasherize(name) %>-component'
 */
@Component({
  selector: '<%= dasherize(name) %>-component',
  template(this: <%= classify(name) %>Component) {
    return html`
      <header>
        <h1>${this.name}</h1>
      </header>
      ${async(this.timer)} ${JSON.stringify(this.params)}
      <div>
        1
      </div>
      <div>
        2
      </div>
    `;
  }
})
export class <%= classify(name) %>Component extends LitElement implements OnInit, OnDestroy, OnUpdate {
  @property() private name: string;

  @RouteParams() private params: any;

  @queryAll('div') private divs: HTMLElement[];

  private timer = timer(1, 1000).pipe(map(v => v));

  OnInit() {
    console.log('<%= classify(name) %>Component component init');
  }

  OnDestroy() {
    console.log('<%= classify(name) %>Component component destroyed');
  }

  OnUpdate() {
    console.log('<%= classify(name) %>Component component updated');
  }
}
