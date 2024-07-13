import { z } from "zod";

// Schema for the input data when submitting a student report
const studentReportInputSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  reportDate: z.string().min(1, "Report date is required"),  // Assuming date is a string
  reportText: z.string().min(1, "Report text is required"),
});

// Schema for the output data of sentiment analysis
const SentimentAnalysisOutputTypeSchema = z.object({
  positive: z.number().min(0).max(100).default(0),  // Overall Positive sentiment percentage
  negative: z.number().min(0).max(100).default(0),  // Overall Negative sentiment percentage
  neutral: z.number().min(0).max(100).default(0),   // Overall Neutral sentiment percentage
  chartData: z.array(
    z.object({
      month: z.string(),  // Month name
        positive: z.number(),  // Positive sentiment 
        negative: z.number(),  // Negative sentiment
        neutral: z.number(),   // Neutral sentiment 
    })
  ),
});

export {
  studentReportInputSchema,
  SentimentAnalysisOutputTypeSchema,
};

export type StudentReportInput = z.infer<typeof studentReportInputSchema>;
export type SentimentAnalysisOutputType = z.infer<typeof SentimentAnalysisOutputTypeSchema>;
