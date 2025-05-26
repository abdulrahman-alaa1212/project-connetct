
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, Download, Edit3, CheckCircle, XCircle, UserCircle, Loader2, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StoredCvData {
  name: string;
  type: string;
  size: number; // in bytes
  lastUpdated: string; // ISO string
  // In a real app, might store a URL or a reference to actual file data for download
  // For mock, we only store metadata.
}

export default function ManageCvPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [storedCvInfo, setStoredCvInfo] = useState<StoredCvData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const cvStorageKey = user ? `user_cv_metadata_${user.id}` : null;

  useEffect(() => {
    if (cvStorageKey) {
      const storedCvJson = localStorage.getItem(cvStorageKey);
      if (storedCvJson) {
        try {
          setStoredCvInfo(JSON.parse(storedCvJson));
        } catch (e) {
          console.error("Failed to parse stored CV data from localStorage", e);
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
        setSelectedCvFile(null);
        return;
      }
      if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF, DOC, or DOCX file.",
        });
        event.target.value = ''; // Clear the input
        setSelectedCvFile(null);
        return;
      }
      setSelectedCvFile(file);
    } else {
      setSelectedCvFile(null);
    }
     // Clear file input to allow re-selection of the same file
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleUploadCv = async () => {
    if (!selectedCvFile || !cvStorageKey) {
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

    const newCvData: StoredCvData = {
      name: selectedCvFile.name,
      type: selectedCvFile.type,
      size: selectedCvFile.size,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(cvStorageKey, JSON.stringify(newCvData));
    setStoredCvInfo(newCvData);
    
    setIsUploading(false);
    toast({
      title: "CV Updated Successfully",
      description: `${selectedCvFile.name} has been set as your current CV.`,
    });
    setSelectedCvFile(null); // Clear the selected file after upload
  };
  
  const handleDownloadMockCv = () => {
    if (!storedCvInfo) {
      toast({ variant: "destructive", title: "No CV", description: "No CV has been uploaded to download."});
      return;
    }
    // Simulate download of the stored CV
    const mockContent = `This is a mock download for your CV: ${storedCvInfo.name}\nType: ${storedCvInfo.type}\nSize: ${(storedCvInfo.size / 1024).toFixed(2)} KB\nLast Updated: ${new Date(storedCvInfo.lastUpdated).toLocaleString()}`;
    const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Mock_CV_${storedCvInfo.name.split('.')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Mock CV Downloaded", description: "A text file representing your CV has been downloaded." });
  };

  if (user?.role !== 'professional') {
    return (
        <div className="flex items-center justify-center h-full p-4">
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
          <CardTitle className="text-xl">Current CV Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {storedCvInfo ? (
            <>
              <div className="flex items-center p-3 border rounded-md bg-muted text-sm">
                <FileText className="h-8 w-8 mr-4 text-primary flex-shrink-0" />
                <div className="space-y-1">
                  <p><span className="font-semibold">Filename:</span> {storedCvInfo.name}</p>
                  <p><span className="font-semibold">Type:</span> {storedCvInfo.type}</p>
                  <p><span className="font-semibold">Size:</span> {(storedCvInfo.size / 1024).toFixed(2)} KB</p>
                  <p><span className="font-semibold">Last Updated:</span> {new Date(storedCvInfo.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" onClick={handleDownloadMockCv}>
                  <Download className="mr-2 h-4 w-4" /> Download My CV (Mock)
                </Button>
              </div>
            </>
          ) : (
             <Alert variant="default" className="border-blue-200 bg-blue-50 text-blue-700">
                <Info className="h-5 w-5 text-blue-600" />
                <AlertTitle>No CV on File</AlertTitle>
                <AlertDescription>You haven&apos;t uploaded a CV yet. Please upload one below.</AlertDescription>
            </Alert>
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
                    accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {selectedCvFile && <span className="text-sm text-muted-foreground truncate max-w-xs">Selected: {selectedCvFile.name}</span>}
            </div>

            {selectedCvFile && (
                 <Alert variant="default" className="bg-green-50 border-green-200 text-green-700">
                    <CheckCircle className="h-5 w-5 text-green-600"/>
                    <AlertTitle>File Ready for Upload</AlertTitle>
                    <AlertDescription>
                    "{selectedCvFile.name}" is selected. Click the button below to set it as your current CV.
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUploadCv} disabled={!selectedCvFile || isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {storedCvInfo ? "Upload & Replace Current CV" : "Upload & Set as Current CV"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    