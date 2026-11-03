import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  BrowserLoginResult,
  startBrowserLogin,
  StartResponse,
  waitForApproval,
} from '../auth/browser-login';
import { loginWithToken } from '../auth/login';

/*
 * mcp:start before `gcli login` (feature cli-browser-login): instead of
 * exiting, serve ONE tool. The agent calls it, shows the user the link and
 * code, the user approves in the browser, and this process saves the login
 * like `gcli login` would. The user then reconnects the server (`/mcp` in
 * Claude Code) and gets every Lambforge tool. The agent can only hand out
 * the link - approving needs the signed-in user on lambforge.com.
 */

export const LOGIN_TOOL = 'LambforgeLogin';

type GateState =
  | { kind: 'idle' }
  | { kind: 'waiting'; start: StartResponse }
  | { kind: 'done' }
  | { kind: 'failed'; error: string };

const log = (line: string) => process.stderr.write(`${line}\n`);

export const startLoginGate = async (apiUrl: string) => {
  let state: GateState = { kind: 'idle' };

  const begin = async () => {
    const start = await startBrowserLogin(apiUrl);
    state = { kind: 'waiting', start };
    log(
      `Lambforge login: open ${start.verificationUrl} (code ${start.userCode})`,
    );
    waitForApproval(apiUrl, start)
      .then(async ({ token, key }: BrowserLoginResult) => {
        await loginWithToken({
          token,
          key,
          url: apiUrl,
          uploadUrl: '',
          ci: false,
          silent: true,
        });
        state = { kind: 'done' };
        log('Lambforge login saved - reconnect this MCP server.');
      })
      .catch((e: Error) => {
        state = { kind: 'failed', error: e.message };
        log(`Lambforge login failed: ${e.message}`);
      });
    return start;
  };

  const answer = async (): Promise<string> => {
    if (state.kind === 'done') {
      return 'Logged in. Ask the user to reconnect the "lambforge" MCP server (in Claude Code: /mcp -> lambforge -> Reconnect); after that every Lambforge tool is available.';
    }
    if (state.kind === 'waiting') {
      const { start } = state;
      return `Still waiting. Ask the user to open ${start.verificationUrl} and approve code ${start.userCode}, then call ${LOGIN_TOOL} again.`;
    }
    const start = await begin();
    return [
      'Not logged in to Lambforge yet. Show the user this link and code:',
      '',
      `  ${start.verificationUrl}`,
      `  Code: ${start.userCode}`,
      '',
      'They open it (signed in to lambforge.com), check the code matches and press Approve.',
      `Then call ${LOGIN_TOOL} again; it reports when the login is saved.`,
      'You cannot approve it yourself.',
    ].join('\n');
  };

  const server = new Server(
    { name: 'gapi-proxy', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: LOGIN_TOOL,
        description:
          'gcli is not logged in to Lambforge, so no other Lambforge tool is available yet. Call this to get a login link and code for the user; call again to check whether they approved it.',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== LOGIN_TOOL) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Not logged in to Lambforge - call ${LOGIN_TOOL} first.`,
          },
        ],
      };
    }
    try {
      return { content: [{ type: 'text', text: await answer() }] };
    } catch (e) {
      if (state.kind === 'failed') state = { kind: 'idle' };
      return {
        isError: true,
        content: [{ type: 'text', text: (e as Error).message }],
      };
    }
  });
  await server.connect(new StdioServerTransport());
  log(`Not logged in - serving only ${LOGIN_TOOL}.`);
  await new Promise(() => undefined);
};
