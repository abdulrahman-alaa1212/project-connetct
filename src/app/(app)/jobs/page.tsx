
"use client";

import { useState, useEffect } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import { CvUploadDialog } from "@/components/jobs/CvUploadDialog";
import type { JobPosting } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, MapPin, Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

const mockJobs: JobPosting[] = [
  {
    id: "1",
    title: "VR Software Engineer",
    company: "Innovatech VR Solutions",
    location: "San Francisco, CA",
    description: "Join our team to build cutting-edge VR experiences for medical training. Strong Unity/C# skills required.",
    datePosted: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: "Full-time",
    companyLogo: "https://placehold.co/100x100.png?text=IVS",
    dataAiHint: "technology company logo",
    postedByAdmin: true,
  },
  {
    id: "2",
    title: "AR/MR Content Developer",
    company: "Healthcare XR Inc.",
    location: "Remote",
    description: "Create interactive AR/MR modules for patient education and surgical planning. Experience with HoloLens or Magic Leap preferred.",
    datePosted: new Date(Date.now() - 86400000 * 5).toISOString(),
    type: "Contract",
    companyLogo: "https://placehold.co/100x100.png?text=HXR",
    dataAiHint: "medical tech logo",
    postedByAdmin: true,
  },
  {
    id: "3",
    title: "XR Project Manager (Healthcare)",
    company: "MedSimulators Co.",
    location: "Boston, MA",
    description: "Lead exciting XR projects in the healthcare domain. Manage timelines, budgets, and stakeholder communication.",
    datePosted: new Date(Date.now() - 86400000 * 1).toISOString(),
    type: "Full-time",
    companyLogo: "https://placehold.co/100x100.png?text=MSC",
    dataAiHint: "simulation company logo",
    postedByAdmin: true,
  },
  {
    id: "4",
    title: "VR Training Specialist",
    company: "Global Medical Training",
    location: "New York, NY",
    description: "Develop and deliver VR-based training programs for healthcare professionals. Strong presentation skills needed.",
    datePosted: new Date(Date.now() - 86400000 * 10).toISOString(),
    type: "Part-time",
    companyLogo: "https://placehold.co/100x100.png?text=GMT",
    dataAiHint: "training company logo",
    postedByAdmin: true,
  },
];


export default function JobBoardPage() {
  const { user } = useAuth(); // Get current user
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isCvUploadOpen, setIsCvUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching jobs
    setTimeout(() => {
      let jobsToDisplay = mockJobs;

      if (user?.role === 'admin') {
        // Admins see only jobs they posted (or all jobs marked as admin-posted in this mock)
        jobsToDisplay = jobsToDisplay.filter(job => job.postedByAdmin);
      }
      // Professionals (and other non-admin roles) see all jobs by default,
      // or this logic could be refined to exclude certain admin-only jobs if needed.

      if (searchTerm) {
        jobsToDisplay = jobsToDisplay.filter(job => 
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (jobTypeFilter !== "all") {
        jobsToDisplay = jobsToDisplay.filter(job => job.type === jobTypeFilter);
      }
      if (locationFilter) {
        jobsToDisplay = jobsToDisplay.filter(job => job.location.toLowerCase().includes(locationFilter.toLowerCase()));
      }
      setFilteredJobs(jobsToDisplay);
      setIsLoading(false);
    }, 500);
  }, [searchTerm, jobTypeFilter, locationFilter, user]); // Add user to dependencies

  const handleApplyClick = (jobId: string) => {
    // This should only be callable by non-admins
    if (user?.role === 'admin') return;

    const job = mockJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setIsCvUploadOpen(true);
    }
  };

  const jobTypes = ["all", ...new Set(mockJobs.map(job => job.type))];

  const pageTitle = user?.role === 'admin' ? "Manage Job & Training Postings" : "Job & Training Opportunities";
  const pageDescription = user?.role === 'admin' 
    ? "View job and training offers published on the platform." 
    : "Find your next role in the exciting field of XR in healthcare.";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">{pageTitle}</CardTitle>
          <CardDescription className="text-muted-foreground">{pageDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by title, company..." 
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
          {/* Admin might have a "Create New Posting" button here in the future */}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">Loading jobs...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onApply={handleApplyClick}
              isAdminView={user?.role === 'admin'} // Pass isAdminView prop
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">No Jobs Found</h3>
            <p className="text-muted-foreground">
              {user?.role === 'admin' 
                ? "You haven't posted any jobs yet, or no jobs match your current filters."
                : "Try adjusting your search filters or check back later."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* CV Upload Dialog should only be relevant for non-admins */}
      {user?.role !== 'admin' && (
        <CvUploadDialog
          job={selectedJob}
          isOpen={isCvUploadOpen}
          onOpenChange={setIsCvUploadOpen}
        />
      )}
    </div>
  );
}
