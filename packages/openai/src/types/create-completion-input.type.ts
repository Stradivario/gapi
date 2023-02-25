import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

export const CreateCompletionInputType = new GraphQLInputObjectType({
  name: 'CreateCompletionInputType',
  fields: () => ({
    model: {
      description:
        'ID of the model to use. You can use the [List models](https://platform.openai.com/docs/api-reference/models/list) API to see all of your available models, or see our [Model overview](/docs/models/overview) for descriptions of them.',
      type: new GraphQLNonNull(GraphQLString),
    },
    prompt: {
      type: new GraphQLNonNull(GraphQLString),
    },
    max_tokens: {
      description:
        "The maximum number of [tokens](/tokenizer) to generate in the completion.  The token count of your prompt plus `max_tokens` cannot exceed the model's context length. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).",
      type: GraphQLInt,
    },

    suffix: {
      description: 'The suffix that comes after a completion of inserted text.',
      type: GraphQLString,
    },

    temperature: {
      description:
        'What [sampling temperature](https://towardsdatascience.com/how-to-sample-from-language-models-682bceb97277) to use. Higher values means the model will take more risks. Try 0.9 for more creative applications, and 0 (argmax sampling) for ones with a well-defined answer.  We generally recommend altering this or `top_p` but not both.',
      type: GraphQLInt,
    },

    top_p: {
      description:
        'An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.  We generally recommend altering this or `temperature` but not both.',
      type: GraphQLInt,
    },

    n: {
      description:
        'How many completions to generate for each prompt.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`.',
      type: GraphQLInt,
    },
    logprobs: {
      description:
        'Include the log probabilities on the `logprobs` most likely tokens, as well the chosen tokens. For example, if `logprobs` is 5, the API will return a list of the 5 most likely tokens. The API will always return the `logprob` of the sampled token, so there may be up to `logprobs+1` elements in the response.  The maximum value for `logprobs` is 5. If you need more than this, please contact us through our [Help center](https://help.openai.com) and describe your use case.',
      type: GraphQLString,
    },

    presence_penalty: {
      description:
        "Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.  [See more information about frequency and presence penalties.](https://platform.openai.com/docs/api-reference/parameter-details)",
      type: GraphQLInt,
    },

    frequency_penalty: {
      description:
        "Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.  [See more information about frequency and presence penalties.](https://platform.openai.com/docs/api-reference/parameter-details)",
      type: GraphQLInt,
    },

    best_of: {
      description:
        'Generates `best_of` completions server-side and returns the "best" (the one with the highest log probability per token). Results cannot be streamed.  When used with `n`, `best_of` controls the number of candidate completions and `n` specifies how many to return – `best_of` must be greater than `n`.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`.',
      type: GraphQLInt,
    },
  }),
});
