import { GraphQLRequestError } from '../src/services/gql-client';
import { errorText } from '../src/services/ui';

describe('GraphQL errors print as the server said them', () => {
  it('the message only, one line per error; the list stays on the error', () => {
    const e = new GraphQLRequestError([
      {
        message: 'Turn hibernation on first - set the working hours.',
        path: ['hibernateProjectNow'],
        extensions: { code: 'DOWNSTREAM_SERVICE_ERROR' },
      },
      { message: 'second' },
    ]);
    expect(errorText(e)).toBe(
      'Turn hibernation on first - set the working hours.\nsecond',
    );
    expect(e.errors[0].path).toEqual(['hibernateProjectNow']);
  });
});
