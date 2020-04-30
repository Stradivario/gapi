import { RemoteGraphQLDataSource } from '@apollo/gateway';

export class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    Object.entries(context.headers || {}).forEach(([key, value]) =>
      request.http.headers.set(key, value),
    );
  }
}
