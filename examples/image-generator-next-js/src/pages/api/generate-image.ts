import {
  StabilityImageGenerationModel,
  generateImageAsFunction,
} from "ai-utils.js";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: { bodyParser: true },
};

const generatePainting = generateImageAsFunction(
  new StabilityImageGenerationModel({
    model: "stable-diffusion-512-v2-1",
    clipGuidancePreset: "FAST_BLUE",
    cfgScale: 10,
    height: 512,
    width: 512,
    samples: 1,
    steps: 30,
  }),
  async (description: string) => [
    { text: description },
    { text: "style of early 19th century painting", weight: 0.5 },
  ]
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { text: description } = req.body;

  const imageBase64 = await generatePainting(description);

  try {
    res.status(200).json(imageBase64);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error?.toString(), error });
    return;
  }
}
