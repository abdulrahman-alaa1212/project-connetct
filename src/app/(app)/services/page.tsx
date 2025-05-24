
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Package, AlertTriangle, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { ProviderService } from "@/types";
import { AddServiceDialog } from "@/components/provider/AddServiceDialog";
import Image from "next/image";
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
import { useToast } from "@/hooks/use-toast";

export default function ManageServicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<ProviderService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ProviderService | null>(null);
  const [serviceIdToDelete, setServiceIdToDelete] = useState<string | null>(null);

  const servicesStorageKey = user ? `provider_services_${user.id}` : null;

  useEffect(() => {
    setIsLoading(true);
    if (servicesStorageKey) {
      const storedServices = localStorage.getItem(servicesStorageKey);
      if (storedServices) {
        setServices(JSON.parse(storedServices));
      }
    }
    setIsLoading(false);
  }, [servicesStorageKey]);

  const saveServicesToLocalStorage = (updatedServices: ProviderService[]) => {
    if (servicesStorageKey) {
      localStorage.setItem(servicesStorageKey, JSON.stringify(updatedServices));
    }
  };

  const handleServiceAdded = (newService: ProviderService) => {
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    saveServicesToLocalStorage(updatedServices);
  };

  const handleServiceUpdated = (updatedService: ProviderService) => {
    const updatedServices = services.map(s => s.id === updatedService.id ? updatedService : s);
    setServices(updatedServices);
    saveServicesToLocalStorage(updatedServices);
    setServiceToEdit(null);
  };
  
  const handleOpenEditDialog = (service: ProviderService) => {
    setServiceToEdit(service);
    setIsAddServiceDialogOpen(true);
  };
  
  const handleOpenCreateDialog = () => {
    setServiceToEdit(null);
    setIsAddServiceDialogOpen(true);
  };

  const handleDeleteService = () => {
    if (!serviceIdToDelete) return;
    const updatedServices = services.filter(s => s.id !== serviceIdToDelete);
    setServices(updatedServices);
    saveServicesToLocalStorage(updatedServices);
    setServiceIdToDelete(null);
    toast({ title: "Service Deleted", description: "The service has been removed from your list." });
  };

  if (user?.role !== 'provider') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">This page is only accessible to Service Providers.</p>
        <Button onClick={() => window.history.back()} className="mt-6">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
              <Building2 className="mr-3 h-8 w-8" /> Manage My Services
            </CardTitle>
            <CardDescription>
              Add, view, and manage the XR services your company offers to hospitals.
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreateDialog} className="mt-4 sm:mt-0 w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading services...</p>
          ) : services.length === 0 ? (
            <div className="text-center py-10">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Services Listed Yet</h3>
              <p className="text-muted-foreground">Click "Add New Service" to showcase your offerings.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className="flex flex-col">
                  <CardHeader>
                     {service.imageUrl && (
                      <div className="relative h-40 w-full mb-2 rounded-md overflow-hidden">
                        <Image
                          src={service.imageUrl}
                          alt={service.name}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint={service.dataAiHint || "service technology"}
                        />
                      </div>
                    )}
                    <CardTitle className="text-xl text-primary">{service.name}</CardTitle>
                    <CardDescription className="text-sm">
                        <span className="font-semibold">Category:</span> {service.category} <br/>
                        <span className="font-semibold">Pricing:</span> {service.pricingModel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>
                    {service.tags && service.tags.length > 0 && (
                        <div className="mt-2">
                            {service.tags.map(tag => (
                                <span key={tag} className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full mr-1 mb-1">{tag}</span>
                            ))}
                        </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEditDialog(service)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => setServiceIdToDelete(service.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddServiceDialog
        isOpen={isAddServiceDialogOpen}
        onOpenChange={setIsAddServiceDialogOpen}
        onServiceAdded={handleServiceAdded}
        onServiceUpdated={handleServiceUpdated}
        serviceToEdit={serviceToEdit}
      />

      <AlertDialog open={!!serviceIdToDelete} onOpenChange={(open) => !open && setServiceIdToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service
              "{services.find(s => s.id === serviceIdToDelete)?.name || 'selected service'}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceIdToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
