import {
  defaultUploadUrl,
  MAIN_LAMBFORGE_API,
  resolveUploadUrl,
} from '~/commands/auth/login-urls';

describe('upload URL defaults', () => {
  it('derives <API origin>/upload-lambda from --url', () => {
    expect(defaultUploadUrl('https://api.lambforge.com')).toBe(
      'https://api.lambforge.com/upload-lambda',
    );
    expect(defaultUploadUrl('https://api.lambforge.com/')).toBe(
      'https://api.lambforge.com/upload-lambda',
    );
    // An API URL with a path: the upload server is on the origin.
    expect(defaultUploadUrl('https://pubsub.graphql-server.com/graphql')).toBe(
      'https://pubsub.graphql-server.com/upload-lambda',
    );
    expect(defaultUploadUrl('http://localhost:9000/graphql')).toBe(
      'http://localhost:9000/upload-lambda',
    );
  });

  it('uses the Lambforge API when no URL is given', () => {
    expect(defaultUploadUrl()).toBe(`${MAIN_LAMBFORGE_API}/upload-lambda`);
    expect(defaultUploadUrl('  ')).toBe(`${MAIN_LAMBFORGE_API}/upload-lambda`);
  });

  it('an explicit --uploadUrl wins; empty falls back to the API URL', () => {
    expect(
      resolveUploadUrl('https://up.example.com/x', 'https://api.lambforge.com'),
    ).toBe('https://up.example.com/x');
    expect(resolveUploadUrl('', 'https://api.lambforge.com')).toBe(
      'https://api.lambforge.com/upload-lambda',
    );
    expect(resolveUploadUrl(undefined, undefined)).toBe(
      `${MAIN_LAMBFORGE_API}/upload-lambda`,
    );
  });
});
