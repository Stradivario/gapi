export interface Context {
  request: Request;
  response: Response;
  getSecret(secret: string): Promise<Record<string, string>>;
  getConfig(secret: string): Promise<Record<string, string>>;
  getLambdaInfo(): {
    name: string;
    namespace: string;
    resourceVersion: string;
    uid: string;
  };
  getQueryParams(): Record<string, string>;
  getBodyParams(): Record<string, string>;
  getRouteParams(): Record<string, string>;
}
