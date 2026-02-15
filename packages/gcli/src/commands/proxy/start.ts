import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { defer, EMPTY, from, lastValueFrom, of, throwError } from 'rxjs';
import {
  catchError,
  defaultIfEmpty,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { Readable } from 'stream';
import { z } from 'zod';

import { GraphqlClienAPI } from '~/services/gql-client';

const fetchLogger = (input: RequestInfo | URL, init?: RequestInit) =>
  lastValueFrom(
    defer(() => from(fetch(input, init))).pipe(
      map((res) => {
        if (res.body) {
          // Convert Node stream → Web stream if needed
          if (typeof res.body.pipeThrough !== 'function') {
            try {
              const webStream = Readable.toWeb(res.body as never);
              Object.defineProperty(res, 'body', { value: webStream });
            } catch (conversionErr) {
              process.stderr.write(
                `[WARN] Stream conversion failed: ${conversionErr}\n`,
              );
            }
          }
        }

        return res;
      }),
      catchError((e) => {
        process.stderr.write(`[ERROR] Fetch error: ${e.message}\n`);
        return throwError(() => e);
      }),
    ),
  );

/**
 * gcli mcp:start --url http://localhost:8000/mcp
 */
export default async function startProxy(cmd: { url: string }) {
  return GraphqlClienAPI.getConfig()
    .pipe(
      take(1),
      map((config) => ({
        ...config,
        mcpUrl: new URL(
          cmd.url ||
            [config.url.replace(/\/graphql$/, ''), '/mcp'].join('') ||
            'http://127.0.0.1:8000/mcp',
        ),
      })),
      tap((config) => {
        config.mcpUrl.searchParams.set('transportType', 'streamable-http');
        process.stderr.write(`Starting MCP proxy → ${config.mcpUrl}\n`);
        process.stderr.write('Retrieving config for auth...\n');
      }),
      switchMap((config) =>
        config?.token
          ? of(config)
          : throwError(
              () => new Error('User is not authenticated (no token in config)'),
            ),
      ),
      tap((config) => {
        process.stderr.write(
          `Config retrieved. Token start: ${config.token.substring(0, 5)}\n`,
        );
      }),
      map((config) => {
        /**
         * 1. Create MCP Client (talks to real server)
         */
        const client = new Client({
          name: 'gapi-proxy-client',
          version: '1.0.0',
        });

        return {
          ...config,
          transport: new StreamableHTTPClientTransport(config.mcpUrl, {
            requestInit: {
              headers: {
                Authorization: config.token,
              },
            },
            fetch: fetchLogger,
          }),
          client,
        };
      }),
      tap(() => {
        process.stderr.write('Connecting to upstream...\n');
      }),
      switchMap((config) =>
        from(config.client.connect(config.transport)).pipe(map(() => config)),
      ),
      tap(() => {
        process.stderr.write('Connected to upstream MCP server\n');
      }),
      // Get capabilities AFTER connection is established
      map((config) => ({
        ...config,
        capabilities: config.client.getServerCapabilities(),
      })),
      tap((config) => {
        process.stderr.write(
          `Upstream capabilities: ${JSON.stringify(config.capabilities)}\n`,
        );
      }),
      map((config) => {
        /**
         * 2. Create MCP Server (Claude talks to this)
         */
        const server = new Server(
          {
            name: 'gapi-proxy',
            version: '1.0.0',
          },
          {
            capabilities: config.capabilities || {},
          },
        );

        /**
         * 3. Generic request forwarding
         * We use fallback handlers to forward all unknown requests/notifications.
         */
        server.fallbackRequestHandler = async (request) =>
          lastValueFrom(
            defer(() => config.client.request(request, z.any())).pipe(
              catchError((e: Error) => {
                process.stderr.write(`Upstream error: ${e.message}\n`);
                return throwError(() => e);
              }),
            ),
          );

        server.fallbackNotificationHandler = async (notification) => {
          await lastValueFrom(
            of(notification).pipe(
              filter((n) => n.method !== 'notifications/initialized'),
              switchMap((n) =>
                defer(() => config.client.notification(n)).pipe(
                  catchError((e) => {
                    process.stderr.write(`Notification error: ${e}\n`);
                    return EMPTY; // swallow like try/catch
                  }),
                ),
              ),
              defaultIfEmpty(null),
            ),
          );
        };

        return server;
      }),
      switchMap((server) => from(server.connect(new StdioServerTransport()))),
      tap(() => {
        process.stderr.write('MCP stdio server ready\n');
      }),
      // Keep the process running indefinitely to handle stdio communication
      switchMap(() => new Promise(() => {})),
    )
    .toPromise();
}
