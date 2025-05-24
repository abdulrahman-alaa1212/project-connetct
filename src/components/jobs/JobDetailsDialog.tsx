
"use client";

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
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, CalendarDays, Building } from "lucide-react";
import Image from "next/image";

interface JobDetailsDialogProps {
  job: JobPosting | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailsDialog({ job, isOpen, onOpenChange }: JobDetailsDialogProps) {
  if (!job) return null;

  const timeSincePosted = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            {job.companyLogo && (
              <Image
                src={job.companyLogo}
                alt={`${job.company} logo`}
                width={60}
                height={60}
                className="rounded-lg border"
                data-ai-hint={job.dataAiHint || "company logo"}
              />
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl text-primary">{job.title}</DialogTitle>
              <DialogDescription className="text-md text-foreground flex items-center">
                <Building className="mr-2 h-4 w-4" /> {job.company}
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">{job.type}</Badge>
          </div>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <span className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" /> {job.location}</span>
            <span className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-primary" /> Posted {timeSincePosted(job.datePosted)}</span>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-1">Job Description:</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap p-3 bg-muted rounded-md">{job.description}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
