import { Context } from './context';
import { log } from './helpers/log';

export default async function (context: Context) {
  const secret = await context.getSecret('test');
  const params = context.getRouteParams();
  const query = context.getQueryParams();
  log('Hello world');
  return {
    status: 200,
    body: { secret, params, query },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
}
