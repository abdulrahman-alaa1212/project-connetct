
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, Download, Edit3, CheckCircle, XCircle, UserCircle, Loader2 } from "lucide-react"; // Added UserCircle and Loader2
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ManageCvPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvLastUpdated, setCvLastUpdated] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const cvStorageKey = user ? `user_cv_data_${user.id}` : null;

  useEffect(() => {
    if (cvStorageKey) {
      const storedCvData = localStorage.getItem(cvStorageKey);
      if (storedCvData) {
        try {
          const data = JSON.parse(storedCvData);
          setCvFileName(data.name);
          setCvLastUpdated(data.lastUpdated);
        } catch (e) {
          console.error("Failed to parse CV data from localStorage", e);
          localStorage.removeItem(cvStorageKey); // Clear corrupted data
        }
      }
    }
  }, [cvStorageKey]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "CV file size should not exceed 5MB.",
        });
        event.target.value = ''; // Clear the input
        return;
      }
      if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF, DOC, or DOCX file.",
        });
        event.target.value = ''; // Clear the input
        return;
      }
      setCvFile(file);
      setCvFileName(file.name); // Show selected file name immediately
    }
  };

  const handleUploadCv = async () => {
    if (!cvFile || !cvStorageKey) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a CV file to upload.",
      });
      return;
    }
    setIsUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newLastUpdated = new Date().toLocaleString();
    const cvDataToStore = {
      name: cvFile.name,
      lastUpdated: newLastUpdated,
      // In a real app, you'd store a URL from a cloud storage service here, not the file itself.
      // For mock: we are just storing metadata.
    };
    localStorage.setItem(cvStorageKey, JSON.stringify(cvDataToStore));
    setCvLastUpdated(newLastUpdated);
    // setCvFileName(cvFile.name) is already set by handleFileChange

    setIsUploading(false);
    toast({
      title: "CV Uploaded Successfully",
      description: `${cvFile.name} has been set as your current CV.`,
    });
    setCvFile(null); // Clear the selected file after upload
  };
  
  if (user?.role !== 'professional') {
    return (
        <div className="flex items-center justify-center h-full">
            <Alert variant="destructive" className="max-w-lg">
                <XCircle className="h-5 w-5"/>
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                This page is only accessible to Professionals.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
            <UserCircle className="mr-3 h-8 w-8" /> Manage My CV
          </CardTitle>
          <CardDescription>
            Upload and manage your curriculum vitae. This CV will be used when you apply for opportunities.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Current CV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cvFileName ? (
            <>
              <div className="flex items-center p-3 border rounded-md bg-muted">
                <FileText className="h-6 w-6 mr-3 text-primary" />
                <div>
                  <p className="font-medium">{cvFileName}</p>
                  <p className="text-xs text-muted-foreground">Last Updated: {cvLastUpdated}</p>
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" disabled>
                  <Download className="mr-2 h-4 w-4" /> View/Download CV (Coming Soon)
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No CV has been uploaded yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Upload New or Replace CV</CardTitle>
          <CardDescription>Accepted formats: PDF, DOC, DOCX. Max size: 5MB.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
                <label htmlFor="cv-upload-input" className="cursor-pointer">
                    <Button asChild variant="outline">
                        <span><UploadCloud className="mr-2 h-4 w-4" /> Choose CV File</span>
                    </Button>
                </label>
                 <Input
                    id="cv-upload-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {cvFile && <span className="text-sm text-muted-foreground truncate max-w-xs">Selected: {cvFile.name}</span>}
            </div>

            {cvFile && (
                 <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
                    <CheckCircle className="h-5 w-5 text-blue-600"/>
                    <AlertTitle>File Ready</AlertTitle>
                    <AlertDescription>
                    "{cvFile.name}" is selected. Click "Upload & Set as Current" to save it.
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUploadCv} disabled={!cvFile || isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {cvFileName ? "Upload & Replace Current CV" : "Upload & Set as Current CV"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
