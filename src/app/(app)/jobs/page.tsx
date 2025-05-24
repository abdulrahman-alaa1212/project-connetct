
"use client";

import { useState, useEffect, useCallback } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import { CvUploadDialog } from "@/components/jobs/CvUploadDialog";
import { CreateJobPostingDialog } from "@/components/jobs/CreateJobPostingDialog"; 
import { JobDetailsDialog } from "@/components/jobs/JobDetailsDialog"; // New dialog for viewing
import type { JobPosting } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, MapPin, Briefcase, PlusCircle, Edit3, Trash2, Eye } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth"; 
import { useToast } from "@/hooks/use-toast";

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
  const { user } = useAuth(); 
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobPosting[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<JobPosting | null>(null);
  const [isCvUploadOpen, setIsCvUploadOpen] = useState(false);
  
  // State for admin operations
  const [isUpsertJobDialogOpen, setIsUpsertJobDialogOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<JobPosting | null>(null);
  
  const [jobToView, setJobToView] = useState<JobPosting | null>(null);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);

  const [jobIdToDelete, setJobIdToDelete] = useState<string | null>(null);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const updateFilteredJobs = useCallback(() => {
    let jobsToDisplay = [...jobs];

    if (user?.role === 'admin') {
      // Admins see all jobs by default for management, could add a "my postings" filter later
      // jobsToDisplay = jobsToDisplay.filter(job => job.postedByAdmin); 
    }
    
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
  }, [jobs, searchTerm, jobTypeFilter, locationFilter, user]);

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching jobs
    setTimeout(() => {
      updateFilteredJobs();
      setIsLoading(false);
    }, 300);
  }, [updateFilteredJobs]);


  const handleApplyClick = (jobId: string) => {
    if (user?.role === 'admin') return;
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobForApplication(job);
      setIsCvUploadOpen(true);
    }
  };

  const handleJobCreated = (newJob: JobPosting) => {
    setJobs(prevJobs => [newJob, ...prevJobs]);
    // updateFilteredJobs will be called by useEffect due to jobs dependency change
  };

  const handleJobUpdated = (updatedJob: JobPosting) => {
    setJobs(prevJobs => prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    // updateFilteredJobs will be called by useEffect
  };
  
  const handleOpenCreateDialog = () => {
    setJobToEdit(null); // Ensure we are in "create" mode
    setIsUpsertJobDialogOpen(true);
  };

  const handleOpenEditDialog = (job: JobPosting) => {
    setJobToEdit(job);
    setIsUpsertJobDialogOpen(true);
  };
  
  const handleOpenViewDialog = (job: JobPosting) => {
    setJobToView(job);
    setIsViewDetailsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (jobId: string) => {
    setJobIdToDelete(jobId);
    setIsDeleteConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (jobIdToDelete) {
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobIdToDelete));
      toast({ title: "Job Posting Deleted", description: "The job posting has been removed." });
    }
    setJobIdToDelete(null);
    setIsDeleteConfirmDialogOpen(false);
    // updateFilteredJobs will be called by useEffect
  };


  const jobTypes = ["all", ...new Set(jobs.map(job => job.type))];

  const pageTitle = user?.role === 'admin' ? "Post & Manage Opportunities" : "Job & Training Opportunities";
  const pageDescription = user?.role === 'admin' 
    ? "Create, view, edit, and manage job and training offers published on the platform." 
    : "Find your next role in the exciting field of XR in healthcare.";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">{pageTitle}</CardTitle>
              <CardDescription className="text-muted-foreground">{pageDescription}</CardDescription>
            </div>
            {user?.role === 'admin' && (
              <Button onClick={handleOpenCreateDialog} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Posting
              </Button>
            )}
          </div>
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
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">Loading opportunities...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onApply={user?.role !== 'admin' ? handleApplyClick : undefined}
              isAdminView={user?.role === 'admin'}
              onAdminView={handleOpenViewDialog}
              onAdminEdit={handleOpenEditDialog}
              onAdminDelete={handleOpenDeleteDialog}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">No Opportunities Found</h3>
            <p className="text-muted-foreground">
              {user?.role === 'admin' 
                ? "You haven't posted any opportunities yet, or none match your current filters."
                : "Try adjusting your search filters or check back later."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {user?.role !== 'admin' && (
        <CvUploadDialog
          job={selectedJobForApplication}
          isOpen={isCvUploadOpen}
          onOpenChange={setIsCvUploadOpen}
        />
      )}

      {/* Dialog for Creating/Editing Job Postings (Admin) */}
      {user?.role === 'admin' && (
         <CreateJobPostingDialog
          isOpen={isUpsertJobDialogOpen}
          onOpenChange={setIsUpsertJobDialogOpen}
          onJobCreated={handleJobCreated}
          jobToEdit={jobToEdit}
          onJobUpdated={handleJobUpdated}
        />
      )}

      {/* Dialog for Viewing Job Details (Admin) */}
      {user?.role === 'admin' && (
        <JobDetailsDialog
          job={jobToView}
          isOpen={isViewDetailsDialogOpen}
          onOpenChange={setIsViewDetailsDialogOpen}
        />
      )}

      {/* Dialog for Confirming Deletion (Admin) */}
      {user?.role === 'admin' && (
        <AlertDialog open={isDeleteConfirmDialogOpen} onOpenChange={setIsDeleteConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the job posting
                "{jobs.find(job => job.id === jobIdToDelete)?.title || 'selected job'}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setJobIdToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
