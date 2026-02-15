import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { take } from 'rxjs/operators';
import { Readable } from 'stream';
import { z } from 'zod';

import { GraphqlClienAPI } from '~/services/gql-client';

/**
 * gcli mcp:start --url http://localhost:8000/mcp
 */
export default async function startProxy(cmd: { url: string }) {
  // const sessionId = randomUUID();
  const baseUrl = cmd.url || 'http://127.0.0.1:8000/mcp';

  const mcpUrl = new URL(baseUrl);
  // mcpUrl.searchParams.set('sessionId', sessionId);
  mcpUrl.searchParams.set('transportType', 'streamable-http'); // Restore this as explicit hint

  process.stderr.write(`Starting MCP proxy → ${mcpUrl}\n`);

  process.stderr.write('Retrieving config for auth...\n');
  const config = await GraphqlClienAPI.getConfig().pipe(take(1)).toPromise();
  if (!config?.token) {
    throw new Error('User is not authenticated (no token in config)');
  }

  process.stderr.write(
    `Config retrieved. Token start: ${config.token.substring(0, 5)}\n`,
  );

  const token = config.token;

  /**
   * 1. Create MCP Client (talks to real server)
   */
  const client = new Client({
    name: 'gapi-proxy-client',
    version: '1.0.0',
  });

  const fetchLogger = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const res = await fetch(input, init);

      if (res.body) {
        // Check if it's a Node stream (PassThrough, Readable, etc) and NOT a Web Stream
        // SDK requires Web Stream for SSE (pipeThrough)
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
    } catch (e) {
      process.stderr.write(`[ERROR] Fetch error: ${e.message}\n`);
      throw e;
    }
  };

  const transport = new StreamableHTTPClientTransport(mcpUrl, {
    requestInit: {
      headers: {
        Authorization: token,
      },
    },
    fetch: fetchLogger,
  });

  process.stderr.write('Connecting to upstream...\n');
  await client.connect(transport);

  process.stderr.write('Connected to upstream MCP server\n');

  const capabilities = client.getServerCapabilities();
  process.stderr.write(
    `Upstream capabilities: ${JSON.stringify(capabilities)}\n`,
  );

  /**
   * 2. Create MCP Server (Claude talks to this)
   */
  const server = new Server(
    {
      name: 'gapi-proxy',
      version: '1.0.0',
    },
    {
      capabilities: capabilities || {},
    },
  );

  /**
   * 3. Generic request forwarding
   * We use fallback handlers to forward all unknown requests/notifications.
   */
  server.fallbackRequestHandler = async (request) => {
    // process.stderr.write(`Proxying request: ${request.method}\n`);
    try {
      const response = await client.request(request, z.any());
      return response;
    } catch (e) {
      process.stderr.write(`Upstream error: ${e.message}\n`);
      throw e;
    }
  };

  server.fallbackNotificationHandler = async (notification) => {
    // process.stderr.write(`Proxying notification: ${notification.method}\n`);
    if (notification.method !== 'notifications/initialized') {
      try {
        await client.notification(notification);
      } catch (e) {
        process.stderr.write(`Notification error: ${e}\n`);
      }
    }
  };

  /**
   * 4. Connect stdio transport (CRITICAL for Claude)
   */
  const stdio = new StdioServerTransport();
  await server.connect(stdio);

  process.stderr.write('MCP stdio server ready\n');

  // Keep the process running indefinitely to handle stdio communication
  await new Promise(() => {});
}
