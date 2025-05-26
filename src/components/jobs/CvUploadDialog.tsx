
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
import type { JobPosting, AppliedJob } from "@/types";
import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";


interface CvUploadDialogProps {
  job: JobPosting | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CvUploadDialog({ job, isOpen, onOpenChange }: CvUploadDialogProps) {
  const { user } = useAuth();
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
      const file = files[0];
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "CV file size should not exceed 5MB.",
        });
        event.target.value = ''; // Clear the input
        setFileName(null);
        form.setValue("cvFile", undefined);
        return;
      }
      if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF, DOC, or DOCX file.",
        });
        event.target.value = ''; // Clear the input
        setFileName(null);
        form.setValue("cvFile", undefined);
        return;
      }
      setFileName(file.name);
      form.setValue("cvFile", files); 
    } else {
      setFileName(null);
      form.setValue("cvFile", undefined);
    }
  };

  async function onSubmit(values: z.infer<typeof CvUploadSchema>) {
    if (!job || !user) {
      toast({ variant: "destructive", title: "Error", description: "Job or user information missing." });
      return;
    }
    setIsSubmitting(true);

    try {
      const file = values.cvFile[0];
      // Simulate file "upload" - in a real app, this would go to backend storage.
      // For now, we'll just use the filename for the application record.
      console.log("Simulating CV upload:", file.name);
      console.log("Cover letter:", values.coverLetter);

      const newApplication: AppliedJob = {
        id: Date.now().toString(), // Simple unique ID
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        dateApplied: new Date().toISOString(),
        status: "Submitted",
      };

      // Save to localStorage
      const storageKey = `user_applications_${user.id}`;
      const storedApplications = localStorage.getItem(storageKey);
      let applications: AppliedJob[] = storedApplications ? JSON.parse(storedApplications) : [];
      applications.unshift(newApplication); // Add to the beginning of the list
      localStorage.setItem(storageKey, JSON.stringify(applications));
      
      toast({ title: "Application Submitted!", description: `Your application for ${job.title} has been submitted.` });
      
      form.reset();
      setFileName(null);
      onOpenChange(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: (error as Error).message || "Could not submit your application.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) { // Reset form if dialog is closed
        form.reset();
        setFileName(null);
      }
      onOpenChange(open);
    }}>
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
              render={({ field }) => ( 
                <FormItem>
                  <FormLabel>Upload CV (.pdf, .doc, .docx - max 5MB)</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Input 
                        type="file" 
                        id={`cvFile-${job.id}`} // Ensure unique ID if multiple dialogs could exist (though unlikely here)
                        accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      <label 
                        htmlFor={`cvFile-${job.id}`} 
                        className="flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-input border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none"
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
                <Button type="button" variant="outline" onClick={() => { form.reset(); setFileName(null); }}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !fileName}>
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

    