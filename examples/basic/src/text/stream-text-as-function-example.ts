import {
  OpenAIChatMessage,
  OpenAIChatModel,
  streamTextAsFunction,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const generateStory = streamTextAsFunction(
    new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
    async (topic: string) => [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user(topic),
    ]
  );

  const textStream = await generateStory("A robot learning to love");
  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
