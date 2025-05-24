
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { CreateJobPostingSchema } from "@/lib/schemas";
import type { JobPosting } from "@/types";
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
  FormDescription, // Correctly imported
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
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";

interface CreateJobPostingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated: (newJob: JobPosting) => void;
}

const jobTypes: JobPosting["type"][] = ["Full-time", "Part-time", "Contract", "Internship", "Training"];

export function CreateJobPostingDialog({ isOpen, onOpenChange, onJobCreated }: CreateJobPostingDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof CreateJobPostingSchema>>({
    resolver: zodResolver(CreateJobPostingSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      description: "",
      type: undefined,
      companyLogo: "",
    },
  });

  async function onSubmit(values: z.infer<typeof CreateJobPostingSchema>) {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newJob: JobPosting = {
        id: Date.now().toString(), // Simple unique ID for mock
        title: values.title,
        company: values.company,
        location: values.location,
        description: values.description,
        type: values.type,
        companyLogo: values.companyLogo || `https://placehold.co/100x100.png?text=${values.company.substring(0,3).toUpperCase()}`,
        dataAiHint: "company logo", // Default hint
        datePosted: new Date().toISOString(),
        postedByAdmin: true,
      };

      onJobCreated(newJob);
      toast({ title: "Job Posting Created", description: `"${newJob.title}" has been successfully posted.` });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: (error as Error).message || "Could not create the job posting.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Job/Training Posting
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to publish a new opportunity.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title / Training Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., VR Software Engineer, AR Training Program" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company / Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Innovatech Solutions, Yura Connect Academy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., San Francisco, CA or Remote" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select opportunity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of the role or training..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="companyLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Logo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>If left empty, a placeholder will be generated.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Posting
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
