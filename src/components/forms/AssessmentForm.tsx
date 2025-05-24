"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { AssessmentSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { summarizeAssessment, type SummarizeAssessmentOutput } from "@/ai/flows/summarize-assessment"; // Assuming this exists
import { matchVrArSolutions, type MatchVrArSolutionsOutput } from "@/ai/flows/match-vr-ar-solutions"; // Assuming this exists


export function AssessmentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SummarizeAssessmentOutput | null>(null);
  const [solutionMatches, setSolutionMatches] = useState<MatchVrArSolutionsOutput | null>(null);


  const form = useForm<z.infer<typeof AssessmentSchema>>({
    resolver: zodResolver(AssessmentSchema),
    defaultValues: {
      hospitalName: "",
      vrNeeds: "",
      mrNeeds: "",
      arNeeds: "",
      budget: undefined,
      currentTech: "",
      goals: "",
    },
  });

  async function onSubmit(values: z.infer<typeof AssessmentSchema>) {
    setIsSubmitting(true);
    setSubmissionResult(null);
    setSolutionMatches(null);

    const assessmentDataString = `Hospital: ${values.hospitalName}. VR Needs: ${values.vrNeeds}. MR Needs: ${values.mrNeeds}. AR Needs: ${values.arNeeds}. Budget: ${values.budget}. Current Tech: ${values.currentTech}. Goals: ${values.goals}.`;

    try {
      // Call GenAI to summarize assessment
      const summary = await summarizeAssessment({ assessmentData: assessmentDataString });
      setSubmissionResult(summary);
      toast({ title: "Assessment Summary Generated", description: "View the summary below." });

      // Call GenAI to match solutions
      const matches = await matchVrArSolutions({ assessmentData: assessmentDataString });
      setSolutionMatches(matches);
      toast({ title: "Solution Matches Found", description: "View potential solutions below." });

      // In a real app, you'd save the form data and AI results to a database here.
      console.log("Form submitted:", values);
      console.log("AI Summary:", summary);
      console.log("AI Matches:", matches);

      form.reset(); // Optionally reset form
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: (error as Error).message || "Could not process assessment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const budgetOptions = ["< $10k", "$10k - $50k", "$50k - $200k", "> $200k", "Flexible"];

  return (
    <div className="space-y-6">
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">VR/MR/AR Technology Needs Assessment</CardTitle>
        <CardDescription>Please provide details about your hospital&apos;s requirements.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="hospitalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., City General Hospital" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="vrNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Virtual Reality (VR) Needs</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe specific VR applications or requirements (e.g., surgical training, patient rehabilitation)" {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mrNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mixed Reality (MR) Needs</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe specific MR applications or requirements (e.g., surgical navigation, medical imaging overlay)" {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="arNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Augmented Reality (AR) Needs</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe specific AR applications or requirements (e.g., remote assistance, patient education)" {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Budget</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your budget range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {budgetOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentTech"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Technology Infrastructure</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Briefly describe your existing relevant IT infrastructure, if any (e.g., high-performance computing, existing VR/AR devices)." {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormDescription>This helps in assessing compatibility and integration needs.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Goals for XR Implementation</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What are the key outcomes you hope to achieve with VR/MR/AR technology? (e.g., improve training efficiency, enhance patient outcomes, reduce costs)" {...field} className="min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Assessment
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>

    {submissionResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Assessment Summary (AI Generated)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{submissionResult.summary}</p>
          </CardContent>
        </Card>
      )}

      {solutionMatches && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Suggested Solutions (AI Generated)</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold">Solutions:</h3>
            <p className="whitespace-pre-wrap mb-2">{solutionMatches.suggestedSolutions}</p>
            <h3 className="font-semibold">Reasoning:</h3>
            <p className="whitespace-pre-wrap">{solutionMatches.reasoning}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
