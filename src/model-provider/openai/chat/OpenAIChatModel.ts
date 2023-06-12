import z from "zod";
import { AbstractTextGenerationModel } from "../../../model/text-generation/AbstractTextGenerationModel.js";
import {
  TextGenerationModelSettings,
  TextGenerationModelWithTokenization,
} from "../../../model/text-generation/TextGenerationModel.js";
import { Tokenizer } from "../../../model/tokenization/Tokenizer.js";
import { RunContext } from "../../../run/RunContext.js";
import { callWithRetryAndThrottle } from "../../../util/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createAsyncIterableResponseHandler,
  createJsonResponseHandler,
  createStreamResponseHandler,
  postJsonToApi,
} from "../../../util/api/postToApi.js";
import { convertReadableStreamToAsyncIterable } from "../../../util/convertReadableStreamToAsyncIterable.js";
import { OpenAIModelSettings } from "../OpenAIModelSettings.js";
import { TikTokenTokenizer } from "../TikTokenTokenizer.js";
import { failedOpenAICallResponseHandler } from "../failedOpenAICallResponseHandler.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { createOpenAIChatResponseDeltaStream } from "./OpenAIChatResponseDeltaStream.js";
import { countOpenAIChatPromptTokens } from "./countOpenAIChatMessageTokens.js";

// see https://platform.openai.com/docs/models/
export const OPENAI_CHAT_MODELS = {
  "gpt-4": {
    maxTokens: 8192,
  },
  "gpt-4-0314": {
    maxTokens: 8192,
  },
  "gpt-4-32k": {
    maxTokens: 32768,
  },
  "gpt-4-32k-0314": {
    maxTokens: 32768,
  },
  "gpt-3.5-turbo": {
    maxTokens: 4096,
  },
  "gpt-3.5-turbo-0301": {
    maxTokens: 4096,
  },
};

export type OpenAIChatModelType = keyof typeof OPENAI_CHAT_MODELS;

export interface OpenAIChatCallSettings {
  model: OpenAIChatModelType;
  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface OpenAIChatSettings
  extends TextGenerationModelSettings,
    OpenAIModelSettings,
    OpenAIChatCallSettings {
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create a text generation model that calls the OpenAI chat completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const model = new OpenAIChatModel({
 *   model: "gpt-3.5-turbo",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * const text = await model.generateText([
 *   OpenAIChatMessage.system(
 *     "Write a short story about a robot learning to love:"
 *   ),
 * ]);
 */
export class OpenAIChatModel
  extends AbstractTextGenerationModel<
    OpenAIChatMessage[],
    OpenAIChatResponse,
    OpenAIChatSettings
  >
  implements
    TextGenerationModelWithTokenization<
      OpenAIChatMessage[],
      OpenAIChatSettings
    >
{
  constructor(settings: OpenAIChatSettings) {
    super({
      settings,
      extractText: (response) => response.choices[0]!.message.content,
      generateResponse: (prompt, run) =>
        this.callAPI(
          prompt,
          { responseFormat: OpenAIChatResponseFormat.json },
          run
        ),
    });

    this.tokenizer = new TikTokenTokenizer({ model: this.settings.model });
    this.maxTokens = OPENAI_CHAT_MODELS[this.settings.model].maxTokens;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly tokenizer: Tokenizer;
  readonly maxTokens: number;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.OPENAI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named OPENAI_API_KEY.`
      );
    }

    return apiKey;
  }

  /**
   * Counts the prompt tokens required for the messages. This includes the message base tokens
   * and the prompt base tokens.
   */
  countPromptTokens(messages: OpenAIChatMessage[]) {
    return countOpenAIChatPromptTokens({
      messages,
      model: this.modelName,
    });
  }

  async callAPI<RESULT>(
    input: Array<OpenAIChatMessage>,
    settings: Partial<OpenAIChatCallSettings> &
      OpenAIModelSettings & {
        responseFormat: OpenAIChatResponseFormatType<RESULT>;
        user?: string;
      },
    context?: RunContext
  ): Promise<RESULT> {
    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
        user: this.settings.isUserIdForwardingEnabled
          ? context?.userId
          : undefined,
      },
      this.settings,
      settings
    );

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () =>
        callOpenAIChatCompletionAPI({
          abortSignal: context?.abortSignal,
          messages: input,
          ...callSettings,
        }),
    });
  }

  withSettings(additionalSettings: Partial<OpenAIChatSettings>) {
    return new OpenAIChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
  }
}

const openAIChatResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        role: z.literal("assistant"),
        content: z.string(),
      }),
      index: z.number(),
      logprobs: z.nullable(z.any()),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAIChatResponse = z.infer<typeof openAIChatResponseSchema>;

async function callOpenAIChatCompletionAPI<RESPONSE>({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  responseFormat,
  apiKey,
  model,
  messages,
  temperature,
  topP,
  n,
  stop,
  maxTokens,
  presencePenalty,
  frequencyPenalty,
  user,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  responseFormat: OpenAIChatResponseFormatType<RESPONSE>;
  apiKey: string;
  model: OpenAIChatModelType;
  messages: Array<OpenAIChatMessage>;
  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  user?: string;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: `${baseUrl}/chat/completions`,
    apiKey,
    body: {
      stream: responseFormat.stream,
      model,
      messages,
      top_p: topP,
      n,
      stop,
      max_tokens: maxTokens,
      temperature,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

export type OpenAIChatResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const OpenAIChatResponseFormat = {
  json: {
    stream: false,
    handler: createJsonResponseHandler(openAIChatResponseSchema),
  },
  readStream: {
    stream: true,
    handler: createStreamResponseHandler(),
  },
  asyncUint8ArrayIterable: {
    stream: true,
    handler: createAsyncIterableResponseHandler(),
  },
  asyncDeltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOpenAIChatResponseDeltaStream(
        convertReadableStreamToAsyncIterable(response.body!.getReader())
      ),
  },
};
