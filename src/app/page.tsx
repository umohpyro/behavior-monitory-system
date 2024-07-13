"use client";

import { useRef, useState } from "react";
import { generate } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SentimentAnalysisOutputType } from "@/bmsSchema";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from "@/components/ui/chart";
import { CartesianGrid, XAxis, Line, LineChart } from "recharts";
import ScoreCard from "@/components/score-card";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const InterviewPage: React.FC = () => {
  const [generation, setGeneration] =
    useState<SentimentAnalysisOutputType | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const generateFn = async (input: FormData) => {
    setLoading(true);

    const { object } = await generate(input);

    for await (const partialObject of readStreamableValue(object)) {
      if (partialObject) {
        setGeneration(partialObject);
        setDialogOpen(true);
        formRef?.current?.reset();
      } else {
        console.error(
          "Invalid partialObject structure",
          partialObject.toString()
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4 mx-auto flex items-start justify-evenly">
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto p-4 md:p-8">
        <form
          className="gap-3 max-w-4xl"
          action={generateFn}
          ref={formRef}
        >
          <Card>
            <CardHeader>
              <CardTitle>Student Report</CardTitle>
              <CardDescription>
                Submit a report for sentiment analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Student Name</Label>
                  <Input name="student-name" minLength={3} placeholder="Enter student name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start font-normal"
                      >
                        {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                        <div className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-text">Report</Label>
                <Textarea
                  name="report-text"
                  placeholder="Enter student report"
                  minLength={10}
                  rows={5}
                />
              </div>
              <Button disabled={loading} type="submit" className="w-full">
                {loading ? "Generating..." : "Submit Report"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>

      {generation && (
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {" "}
                <CardHeader>
                  <CardTitle>Feedback Board</CardTitle>
                </CardHeader>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div className="grid gap-8 w-full mx-auto p-4 md:p-8">
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Sentiment Analysis</CardTitle>
                        <CardDescription>
                          Overview of sentiment across different months.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-center space-x-4">
                          <ScoreCard
                            name="positive"
                            key={generation?.positive}
                            percentage={generation?.positive}
                          />
                          <ScoreCard
                            name="negative"
                            key={generation?.negative}
                            percentage={generation?.negative}
                          />
                          <ScoreCard
                            name="neutral"
                            key={generation?.neutral}
                            percentage={generation?.neutral}
                          />
                        </div>
                        <div className="mt-8">
                          <LinechartChart className="aspect-[9/4]" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );

  function LinechartChart(props: any) {
    return (
      <div {...props}>
        <ChartContainer
          config={{
            positive: {
              label: "positive",
              color: "hsl(var(--chart-1))",
            },
            negative: {
              label: "negative",
              color: "#e11d48",
            },
            neutral: {
              label: "neutral",
              color: "#0a0a0a",
            },
          }}
        >
          <LineChart
            accessibilityLayer
            data={generation?.chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="positive"
              type="natural"
              stroke="var(--color-positive)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="negative"
              type="natural"
              stroke="var(--color-negative)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="neutral"
              type="natural"
              stroke="var(--color-neutral)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    );
  }
};

export default InterviewPage;
