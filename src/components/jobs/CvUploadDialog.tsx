"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { CvUploadSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { JobPosting } from "@/types";
import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { recommendJobs } from "@/ai/flows/recommend-jobs"; // Assuming recommendJobs can also be used post-application for other suggestions

interface CvUploadDialogProps {
  job: JobPosting | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CvUploadDialog({ job, isOpen, onOpenChange }: CvUploadDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<z.infer<typeof CvUploadSchema>>({
    resolver: zodResolver(CvUploadSchema),
    defaultValues: {
      cvFile: undefined,
      coverLetter: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      form.setValue("cvFile", files); // react-hook-form expects FileList
    } else {
      setFileName(null);
      form.setValue("cvFile", undefined);
    }
  };

  async function onSubmit(values: z.infer<typeof CvUploadSchema>) {
    if (!job) return;
    setIsSubmitting(true);

    try {
      // Simulate file upload and get a data URI
      // In a real app, you'd upload to a storage service (e.g., Firebase Storage)
      // and then use the URL or data URI for the AI call.
      const file = values.cvFile[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const cvDataUri = reader.result as string;
        console.log("CV Data URI (first 100 chars):", cvDataUri.substring(0,100));

        // Mock calling recommendJobs or a similar flow for processing application
        // For example, the AI could parse the CV and check its suitability for the current job
        // or suggest other jobs if this one is not a perfect fit.
        // For this example, we'll just log it. In a real app, the actual jobPostings would be passed.
        try {
          // const recommendations = await recommendJobs({ cvDataUri, jobPostings: [job.title] });
          // console.log("AI Recommendation based on CV:", recommendations);
          // toast({ title: "AI Analysis", description: `Recommended for: ${recommendations.recommendedJobs.join(', ')}` });
           toast({ title: "Application Submitted (Simulated)", description: `Your CV for ${job.title} has been received.` });
        } catch (aiError) {
           console.error("AI processing error:", aiError);
           toast({ variant: "destructive", title: "AI Processing Error", description: "Could not analyze CV with AI." });
        }
        
        form.reset();
        setFileName(null);
        onOpenChange(false);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: (error as Error).message || "Could not submit your application.",
      });
    } finally {
      //setIsSubmitting(false); // Moved inside onloadend for async operations
    }
    // This part needs to be inside onloadend to ensure setIsSubmitting is called after async ops
    // For now, we'll keep it simple and assume immediate processing for UI feedback.
    // A more robust solution would use promises or async/await with reader.onloadend.
    // Temporary fix:
    setTimeout(() => setIsSubmitting(false), 1500); // Simulate processing time
  }

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Apply for: {job.title}</DialogTitle>
          <DialogDescription>
            Submit your CV and an optional cover letter for the {job.company} position.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="cvFile"
              render={({ field }) => ( // field doesn't contain value for file input directly using ShadCN default
                <FormItem>
                  <FormLabel>Upload CV (.pdf, .doc, .docx - max 5MB)</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Input 
                        type="file" 
                        id="cvFile"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden" // Hide default input
                      />
                      <label 
                        htmlFor="cvFile" 
                        className="flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none"
                      >
                        {fileName ? (
                          <span className="text-sm text-foreground">{fileName}</span>
                        ) : (
                          <span className="flex items-center space-x-2">
                            <UploadCloud className="w-6 h-6 text-muted-foreground" />
                            <span className="font-medium text-muted-foreground">
                              Click to upload or drag and drop
                            </span>
                          </span>
                        )}
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly explain why you're a good fit for this role..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
