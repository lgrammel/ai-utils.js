---
sidebar_position: 5
---

# Generate JSON

Generates JSON using a prompt and a structure.

## Usage

### generateJson

[generateJson API](/api/modules#generatejson)

Generates JSON using a prompt and a structure.
The prompt format depends on the model.
The structure is a JSON object that describes the desired output.
The parameters must be a Zod object schema.

#### With OpenAI chat model

```ts
const story = await generateJson(
  new OpenAIChatModel(/* ... */),
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ],
  {
    name: "story",
    description: "Write the story",
    parameters: z.object({
      title: z.string().describe("The title of the story"),
      content: z.string().describe("The content of the story"),
    }),
  }
);
```

### generateJsonAsFunction

[generateJsonAsFunction API](/api/modules#generatejsonasfunction)

Uses a prompt template to create a function that generates JSON.
The prompt template is a function that takes an input and returns a prompt that matches the model's prompt format.
The input signature of the prompt templates becomes the call signature of the generated function.

#### With OpenAI chat model

```ts
const generateStoryAbout = generateJsonAsFunction(
  new OpenAITextGenerationModel(/* ... */),
  async (theme: string) => [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user(theme),
  ],
  {
    name: "story",
    description: "Write the story",
    parameters: z.object({
      title: z.string().describe("The title of the story"),
      content: z.string().describe("The content of the story"),
    }),
  }
);

const story = await generateStoryAbout("A robot learning to love");
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
