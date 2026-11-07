/** The Lambforge API gcli talks to when `--url` is not given. */
export const MAIN_LAMBFORGE_API = 'https://api.lambforge.com';

/**
 * The upload server for an API URL: its ORIGIN + `/upload-lambda`.
 *
 *   https://api.lambforge.com                 -> https://api.lambforge.com/upload-lambda
 *   https://api.lambforge.com/                -> https://api.lambforge.com/upload-lambda
 *   https://pubsub.graphql-server.com/graphql -> https://pubsub.graphql-server.com/upload-lambda
 *
 * (It used to append to the whole URL: `.../graphql/upload-lambda`, `//upload-lambda`.)
 */
export const defaultUploadUrl = (apiUrl?: string | null): string => {
  const base = apiUrl?.trim() || MAIN_LAMBFORGE_API;
  try {
    return `${new URL(base).origin}/upload-lambda`;
  } catch {
    return `${base.replace(/\/+$/, '')}/upload-lambda`;
  }
};

/** `--uploadUrl` when given, else derived from the API URL. */
export const resolveUploadUrl = (
  uploadUrl?: string | null,
  apiUrl?: string | null,
): string => uploadUrl?.trim() || defaultUploadUrl(apiUrl);
