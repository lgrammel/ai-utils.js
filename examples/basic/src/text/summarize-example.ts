import {
  OpenAIChatMessage,
  OpenAIChatModel,
  summarizeRecursivelyWithTextGenerationAndTokenSplittingAsFunction,
} from "ai-utils.js";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

const summarize =
  summarizeRecursivelyWithTextGenerationAndTokenSplittingAsFunction({
    model: new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    prompt: async ({ text }) => {
      return [
        OpenAIChatMessage.system("Summarize the following text:"),
        OpenAIChatMessage.user(text),
      ];
    },
    reservedCompletionTokens: 1000,
  });

(async () => {
  const sanFranciscoWikipedia = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content;

  const summary = await summarize({
    text: sanFranciscoWikipedia,
  });

  console.log(summary);
})();
