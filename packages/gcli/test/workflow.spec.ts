import 'jest';

jest.mock('../src/services/gql-client', () => ({
  GraphqlClienAPI: {
    listWorkflows: jest.fn(),
    createWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
    generateWorkflowDraft: jest.fn(),
    startWorkflowRun: jest.fn(),
    getWorkflowRun: jest.fn(),
  },
}));
jest.mock('../src/helpers', () => ({ parseProjectId: jest.fn() }));

import { of } from 'rxjs';

import { applyWorkflow } from '../src/commands/workflow/apply';
import {
  formatEvent,
  newEvents,
  parseRunInput,
  parseWorkflowFile,
  taskLambdas,
  toWorkflowYaml,
} from '../src/commands/workflow/definition';
import generate from '../src/commands/workflow/generate';
import run from '../src/commands/workflow/run';
import { parseProjectId } from '../src/helpers';
import { GraphqlClienAPI } from '../src/services/gql-client';

const api = GraphqlClienAPI as unknown as Record<string, jest.Mock>;

const definition = {
  startAt: 'charge',
  states: {
    charge: {
      type: 'Task',
      function: { type: 'name', name: 'charge' },
      next: 'mail',
    },
    mail: {
      type: 'Task',
      function: { type: 'name', name: 'mailer' },
      end: true,
    },
  },
};

describe('[workflow] files', () => {
  it('reads every supported shape', () => {
    expect(
      parseWorkflowFile(
        toWorkflowYaml({ name: 'order', description: 'd', definition }),
      ),
    ).toEqual({ name: 'order', description: 'd', definition });
    expect(parseWorkflowFile(JSON.stringify(definition))).toEqual({
      definition,
    });
    expect(
      parseWorkflowFile(
        'apiVersion: fission.io/v1\nkind: Workflow\nmetadata:\n  name: order\nspec:\n  startAt: a\n  states:\n    a:\n      type: Succeed\n',
      ),
    ).toEqual({
      name: 'order',
      definition: { startAt: 'a', states: { a: { type: 'Succeed' } } },
    });
    expect(() => parseWorkflowFile('foo: 1')).toThrow(
      /No workflow definition found/,
    );
  });

  it('parses run input and lists the lambdas', () => {
    expect(parseRunInput('')).toEqual({});
    expect(parseRunInput('{"a":1}')).toEqual({ a: 1 });
    expect(() => parseRunInput('{a')).toThrow(/not valid JSON/);
    expect(taskLambdas(definition)).toEqual(['charge', 'mailer']);
  });

  it('renders events once each', () => {
    const run = {
      name: 'r',
      events: [
        { seq: 2, type: 'StepScheduled', state: 'charge', attempt: 2 },
        { seq: 1, type: 'RunStarted' },
      ],
    };
    expect(newEvents(run, 0).map((e) => e.seq)).toEqual([1, 2]);
    expect(newEvents(run, 1).map((e) => e.seq)).toEqual([2]);
    expect(formatEvent(run.events[0])).toContain('charge  started (attempt 2)');
  });
});

describe('[workflow] commands', () => {
  beforeEach(() => {
    Object.values(api).forEach((m) => m.mockReset());
    (parseProjectId as jest.Mock).mockReturnValue(of('proj-1'));
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('apply creates a new workflow and updates an existing one', async () => {
    api.listWorkflows.mockReturnValue(of([{ id: 'w1', name: 'order' }]));
    api.updateWorkflow.mockReturnValue(of({ name: 'order', definition }));
    api.createWorkflow.mockReturnValue(of({ name: 'other', definition }));
    await applyWorkflow('proj-1', { name: 'order', definition }).toPromise();
    expect(api.updateWorkflow).toHaveBeenCalledWith('proj-1', 'w1', {
      description: undefined,
      definition,
    });
    await applyWorkflow('proj-1', { name: 'other', definition }).toPromise();
    expect(api.createWorkflow).toHaveBeenCalledWith(
      'proj-1',
      expect.objectContaining({ name: 'other', definition }),
    );
    expect(() => applyWorkflow('proj-1', { definition })).toThrow(
      /needs a name/,
    );
  });

  it('generate changes an existing workflow and applies with --apply', async () => {
    api.listWorkflows.mockReturnValue(
      of([{ id: 'w1', name: 'order', definition }]),
    );
    api.generateWorkflowDraft.mockReturnValue(
      of({ definition, explanation: 'ok', warnings: ['create mailer'] }),
    );
    api.updateWorkflow.mockReturnValue(of({ name: 'order', definition }));
    await generate({ name: 'order', description: 'add a wait', apply: true });
    expect(api.generateWorkflowDraft).toHaveBeenCalledWith(
      'proj-1',
      'add a wait',
      definition,
    );
    expect(api.updateWorkflow).toHaveBeenCalled();
    await expect(generate({ description: ' ' })).rejects.toThrow(
      /Describe the workflow/,
    );
  });

  it('run --wait follows the run to the end', async () => {
    api.listWorkflows.mockReturnValue(of([{ id: 'w1', name: 'order' }]));
    api.startWorkflowRun.mockReturnValue(of({ name: 'order-1' }));
    api.getWorkflowRun.mockReturnValue(
      of({
        name: 'order-1',
        phase: 'Succeeded',
        output: { ok: true },
        events: [{ seq: 1, type: 'RunSucceeded' }],
      }),
    );
    const result = await run({ name: 'order', input: '{"id":1}', wait: true });
    expect(api.startWorkflowRun).toHaveBeenCalledWith('proj-1', 'w1', {
      id: 1,
    });
    expect(result).toMatchObject({ phase: 'Succeeded' });
  });
});
