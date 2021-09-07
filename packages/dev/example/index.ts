interface Context {
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

export default async function (context: Context) {
  const secret = await context.getSecret('test');
  const params = context.getRouteParams();
  const query = context.getQueryParams();
  console.log('UPDATE');
  return {
    status: 200,
    body: { secret, params, query },
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:1234',
    },
  };
}
