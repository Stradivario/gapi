### @gapi/openai


#### Installation

```bash
npm install @gapi/openai
```

#### Usage

```typescript
import { Module } from '@gapi/core';
import { OpenAIModue } from '@gapi/openai';

@Module({
  imports: [
    OpenAIModue.forRoot({
      organization: 'org-ahnoIvsiO25Jq4hXeMxO3Fo8',
      apiKey: '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',
    })
  ]
})
export class AppModule {}
```


#### Exposed graphql mutation after importing

```graphql
mutation {
  createCompletion(
    payload: {
      model: "text-davinci-003"
      prompt: "Can you write a description for a trello like card based on this text 'Create home landing page'"
      max_tokens: 2048
    }
  ) {
    id
    object
    created
    model
    choices {
      text
      index
      logprobs
      finish_reason
    }
    usage {
      prompt_tokens
      completion_tokens
      total_tokens
    }
  }
}
```

#### Extending the OpenAPI graphql endpoints using internal provided injection token `OpenAI`

```typescript
import { Controller, GraphQLNonNull, Inject, Mutation, Type } from '@gapi/core';
import {
  CreateCompletionInputType,
  CreateCompletionRequest,
  CreateCompletionType,
  OpenAI,
} from '@gapi/openai';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller()
export class CustomControllerController {
  constructor(@Inject(OpenAI) private openai: OpenAI) {}

  @Type(CreateCompletionType)
  @Mutation({
    payload: {
      type: new GraphQLNonNull(CreateCompletionInputType),
    },
  })
  createCompletion(root, { payload }: { payload: CreateCompletionRequest }) {
    return from(
      this.openai.createCompletion({
        ...payload,
        max_tokens: payload.max_tokens ?? 2048,
      }),
    ).pipe(map((res) => res.data));
  }
}

```
