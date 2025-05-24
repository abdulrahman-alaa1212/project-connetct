
import type { JobPosting } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, CalendarDays, ArrowRight, Edit3, Trash2, Eye } from "lucide-react"; // Added more icons
import Image from "next/image";

interface JobCardProps {
  job: JobPosting;
  onApply: (jobId: string) => void;
  isAdminView?: boolean; // New prop
}

export function JobCard({ job, onApply, isAdminView }: JobCardProps) {
  const timeSincePosted = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start gap-4">
          {job.companyLogo && (
            <Image 
              src={job.companyLogo} 
              alt={`${job.company} logo`} 
              width={50} 
              height={50} 
              className="rounded-md border"
              data-ai-hint={job.dataAiHint || "company logo"}
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-xl text-primary">{job.title}</CardTitle>
            <CardDescription className="text-sm text-foreground">{job.company}</CardDescription>
          </div>
          <Badge variant="secondary">{job.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
        <div className="flex items-center text-xs text-muted-foreground gap-4">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Posted {timeSincePosted(job.datePosted)}</span>
        </div>
      </CardContent>
      <CardFooter>
        {isAdminView ? (
          <div className="flex w-full gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="flex-1 min-w-[80px]" onClick={() => console.log("View details for job:", job.id)} >
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
            <Button variant="outline" size="sm" className="flex-1 min-w-[80px]" onClick={() => console.log("Edit job:", job.id)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" size="sm" className="flex-1 min-w-[90px]" onClick={() => console.log("Delete job:", job.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        ) : (
          <Button onClick={() => onApply(job.id)} className="w-full">
            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
