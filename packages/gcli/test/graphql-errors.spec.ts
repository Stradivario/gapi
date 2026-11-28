import { GraphQLRequestError } from '../src/services/gql-client';
import { errorText } from '../src/services/ui';

describe('GraphQL errors print as the server said them', () => {
  it('the message only, one line per error; the list stays on the error', () => {
    const e = new GraphQLRequestError([
      {
        message: 'No sleep schedule "office" in this project.',
        path: ['sleepScheduleNow'],
        extensions: { code: 'DOWNSTREAM_SERVICE_ERROR' },
      },
      { message: 'second' },
    ]);
    expect(errorText(e)).toBe(
      'No sleep schedule "office" in this project.\nsecond',
    );
    expect(e.errors[0].path).toEqual(['sleepScheduleNow']);
  });
});
