"use client";

import { useState, useEffect } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import { CvUploadDialog } from "@/components/jobs/CvUploadDialog";
import type { JobPosting } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockJobs: JobPosting[] = [
  {
    id: "1",
    title: "VR Software Engineer",
    company: "Innovatech VR Solutions",
    location: "San Francisco, CA",
    description: "Join our team to build cutting-edge VR experiences for medical training. Strong Unity/C# skills required.",
    datePosted: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    type: "Full-time",
    companyLogo: "https://placehold.co/100x100.png?text=IVS",
  },
  {
    id: "2",
    title: "AR/MR Content Developer",
    company: "Healthcare XR Inc.",
    location: "Remote",
    description: "Create interactive AR/MR modules for patient education and surgical planning. Experience with HoloLens or Magic Leap preferred.",
    datePosted: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    type: "Contract",
    companyLogo: "https://placehold.co/100x100.png?text=HXR",
  },
  {
    id: "3",
    title: "XR Project Manager (Healthcare)",
    company: "MedSimulators Co.",
    location: "Boston, MA",
    description: "Lead exciting XR projects in the healthcare domain. Manage timelines, budgets, and stakeholder communication.",
    datePosted: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    type: "Full-time",
    companyLogo: "https://placehold.co/100x100.png?text=MSC",
  },
  {
    id: "4",
    title: "VR Training Specialist",
    company: "Global Medical Training",
    location: "New York, NY",
    description: "Develop and deliver VR-based training programs for healthcare professionals. Strong presentation skills needed.",
    datePosted: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    type: "Part-time",
    companyLogo: "https://placehold.co/100x100.png?text=GMT",
  },
];


export default function JobBoardPage() {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isCvUploadOpen, setIsCvUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState(""); // Simple text filter for location
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      let jobs = mockJobs;
      if (searchTerm) {
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (jobTypeFilter !== "all") {
        jobs = jobs.filter(job => job.type === jobTypeFilter);
      }
      if (locationFilter) {
        jobs = jobs.filter(job => job.location.toLowerCase().includes(locationFilter.toLowerCase()));
      }
      setFilteredJobs(jobs);
      setIsLoading(false);
    }, 500);
  }, [searchTerm, jobTypeFilter, locationFilter]);

  const handleApplyClick = (jobId: string) => {
    const job = mockJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setIsCvUploadOpen(true);
    }
  };

  const jobTypes = ["all", ...new Set(mockJobs.map(job => job.type))];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Job & Training Opportunities</CardTitle>
          <p className="text-muted-foreground">Find your next role in the exciting field of XR in healthcare.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by title, company, keyword..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Filter by job type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map(type => (
                  <SelectItem key={type} value={type}>{type === "all" ? "All Job Types" : type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <div className="relative md:col-span-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Filter by location..." 
                className="pl-10"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">Loading jobs...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onApply={handleApplyClick} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">No Jobs Found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters or check back later.</p>
          </CardContent>
        </Card>
      )}

      <CvUploadDialog
        job={selectedJob}
        isOpen={isCvUploadOpen}
        onOpenChange={setIsCvUploadOpen}
      />
    </div>
  );
}
