
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { ProfileUpdateSchema } from "@/lib/schemas";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local state to manage avatar preview if needed, or just use form.watch
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "https://placehold.co/100x100.png");


  const form = useForm<z.infer<typeof ProfileUpdateSchema>>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      });
      setAvatarPreview(user.avatar || "https://placehold.co/100x100.png");
    }
  }, [user, form]);
  
  const watchedAvatar = form.watch("avatar");
  useEffect(() => {
    if (watchedAvatar) {
      setAvatarPreview(watchedAvatar);
    } else if (watchedAvatar === "") {
       setAvatarPreview("https://placehold.co/100x100.png"); // Default if cleared
    }
  }, [watchedAvatar]);


  async function onSubmit(values: z.infer<typeof ProfileUpdateSchema>) {
    setIsSubmitting(true);
    try {
      await updateProfile(values);
      toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: (error as Error).message || "Could not save your profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const fallbackName = user.name ? user.name.substring(0, 2).toUpperCase() : "YC";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <UserCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">User Profile Settings</CardTitle>
          </div>
          <CardDescription>Manage your personal information and account settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview} alt={user.name || "User"} data-ai-hint="person avatar" />
                  <AvatarFallback>{fallbackName}</AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.png" {...field} />
                      </FormControl>
                      <FormDescription>Enter a URL for your profile picture. Leave empty for default.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name / Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name / Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                     <FormDescription>Changing your email might require re-verification in a real application.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Placeholder for Password Change - Future Enhancement */}
              {/* 
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-medium text-foreground">Change Password</h3>
                <Button type="button" variant="outline" disabled>Change Password (Not Implemented)</Button>
                <p className="text-sm text-muted-foreground">This feature will be available soon.</p>
              </div>
              */}

              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || authLoading}>
                {(isSubmitting || authLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
