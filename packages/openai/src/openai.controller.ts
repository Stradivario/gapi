import { Controller, GraphQLNonNull, Inject, Mutation, Type } from '@gapi/core';
import { CompletionCreateParamsNonStreaming } from 'openai/resources/completions';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { OpenAI } from './openai.tokens';
import { CreateCompletionInputType } from './types/create-completion-input.type';
import { CreateCompletionType } from './types/create-completion.type';

@Controller()
export class OpenAIController {
  constructor(@Inject(OpenAI) private openai: OpenAI) {}

  @Type(CreateCompletionType)
  @Mutation({
    payload: {
      type: new GraphQLNonNull(CreateCompletionInputType),
    },
  })
  createCompletion(
    root,
    { payload }: { payload: CompletionCreateParamsNonStreaming },
  ) {
    return from(
      this.openai.completions.create({
        ...payload,
        max_tokens: payload.max_tokens ?? 2048,
      }),
    ).pipe(map((res) => res));
  }

  @Type(CreateCompletionType)
  @Mutation({
    payload: {
      type: new GraphQLNonNull(CreateCompletionInputType),
    },
  })
  createChatCompletion(
    root,
    { payload }: { payload: CompletionCreateParamsNonStreaming },
  ) {
    return from(
      this.openai.completions.create(
        JSON.parse(
          JSON.stringify({
            ...payload,
            messages: [{ role: 'user', content: payload.prompt }],
            max_tokens: payload.max_tokens ?? 2048,
            prompt: undefined,
          }),
        ),
      ),
    ).pipe(map((res) => res));
  }
}
