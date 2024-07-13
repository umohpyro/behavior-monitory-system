"use server";

import { streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import {SentimentAnalysisOutputTypeSchema} from "@/bmsSchema"

export async function generate(input: FormData) {
  "use server";

  const gottenInputs = JSON.stringify(Object.fromEntries(input.entries()));
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: google("models/gemini-1.5-pro-latest"),
      system:
        `You are a behaviour monitoring system expert that analyses reports based on Behavior Monitoring: Use sentiment analysis to monitor student behavior through submitted reports. The system should provide feedback on the sentiment of the report and the risk of the student's behavior. The report contains the following details: ${gottenInputs}  and simulate feedback for the past 6 months to provide a comprehensive analysis. using sentiment analysis schema.${SentimentAnalysisOutputTypeSchema}. NEVER I repeat NEVER return 0 0 0 for all the main positive, negative and neutral values. values should be strictly based on the input data analyzed.`,
      prompt: `process the report submitted and provide feedback on the sentiment of the report and the risk of the student's behavior using sentiment analysis and schema provided. The submitted report contains the following details: ${gottenInputs}`,

      schema: SentimentAnalysisOutputTypeSchema,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}
