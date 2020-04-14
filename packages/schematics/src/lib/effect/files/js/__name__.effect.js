import { Effect, OfType } from '@gapi/core';

@Effect()
export class <%= classify(name) %>Effect {

    @OfType<any>('<%= classify(name) %>')
    <%= classify(name) %>Action(result, payload, context) {
        console.log(result, payload, context);
    }

}