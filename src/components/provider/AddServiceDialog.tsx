
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AddServiceSchema } from "@/lib/schemas";
import type { ProviderService } from "@/types";
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
  FormDescription,
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
import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Edit3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AddServiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceAdded: (newService: ProviderService) => void;
  onServiceUpdated: (updatedService: ProviderService) => void;
  serviceToEdit?: ProviderService | null;
}

const serviceCategories: ProviderService["category"][] = [
  "VR Development", 
  "AR Content Creation", 
  "MR Consultation", 
  "XR Training Solutions", 
  "Hardware Provision", 
  "Platform Services",
  "Other"
];
const pricingModels: ProviderService["pricingModel"][] = [
  "Project-based", 
  "Hourly Rate", 
  "Subscription", 
  "Custom Quote"
];

export function AddServiceDialog({
  isOpen,
  onOpenChange,
  onServiceAdded,
  onServiceUpdated,
  serviceToEdit,
}: AddServiceDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!serviceToEdit;

  const form = useForm<z.infer<typeof AddServiceSchema>>({
    resolver: zodResolver(AddServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: undefined,
      pricingModel: undefined,
      imageUrl: "",
      tags: "" as any, // Zod schema handles transformation
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && serviceToEdit) {
        form.reset({
          name: serviceToEdit.name,
          description: serviceToEdit.description,
          category: serviceToEdit.category,
          pricingModel: serviceToEdit.pricingModel,
          imageUrl: serviceToEdit.imageUrl || "",
          tags: serviceToEdit.tags?.join(", ") || "" as any,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          category: undefined,
          pricingModel: undefined,
          imageUrl: "",
          tags: "" as any,
        });
      }
    }
  }, [isOpen, isEditing, serviceToEdit, form]);

  async function onSubmit(values: z.infer<typeof AddServiceSchema>) {
    if (!user || user.role !== 'provider') {
        toast({ variant: "destructive", title: "Unauthorized", description: "Only providers can add services." });
        return;
    }
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isEditing && serviceToEdit) {
        const updatedService: ProviderService = {
          ...serviceToEdit,
          ...values,
          dataAiHint: values.imageUrl ? "service technology" : undefined,
        };
        onServiceUpdated(updatedService);
        toast({ title: "Service Updated", description: `"${updatedService.name}" has been successfully updated.` });
      } else {
        const newService: ProviderService = {
          id: Date.now().toString(), // Simple unique ID
          providerId: user.id,
          ...values,
          dataAiHint: values.imageUrl ? "service technology" : undefined,
        };
        onServiceAdded(newService);
        toast({ title: "Service Added", description: `"${newService.name}" has been successfully listed.` });
      }
      
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      toast({
        variant: "destructive",
        title: isEditing ? "Update Failed" : "Creation Failed",
        description: (error as Error).message || "Could not save the service.",
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
            {isEditing ? <Edit3 className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {isEditing ? "Edit Service" : "Add New Service"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for your service." : "Fill in the details for the service you offer."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Custom VR Surgical Simulator" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of this service..."
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
              name="pricingModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pricingModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/service-image.png" {...field} />
                  </FormControl>
                   <FormDescription>A relevant image for your service offering.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional, comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., surgery, training, unreal engine" {...field} />
                  </FormControl>
                  <FormDescription>Helps hospitals find your service.</FormDescription>
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
                {isEditing ? "Save Changes" : "Add Service"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
