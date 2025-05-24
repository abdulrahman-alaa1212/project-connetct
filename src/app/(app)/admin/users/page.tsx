
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { User, UserRole } from "@/types";
import { Loader2, Eye, Edit, Users as UsersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// MOCK_USERS_DB from AuthContext is not directly accessible here for a full list.
// We'll define a separate mock list for this page.
const mockPlatformUsers: User[] = [
  { id: "1", name: "City General Hospital", email: "hospital@example.com", role: "hospital", avatar: "https://placehold.co/100x100.png", hospitalId: "hosp1" },
  { id: "hosp_new_1", name: "St. Luke's Medical Center", email: "contact@stlukes.org", role: "hospital", avatar: "https://placehold.co/100x100.png", hospitalId: "hosp_new_1" },
  { id: "2", name: "Dr. Alex Professional", email: "prof@example.com", role: "professional", avatar: "https://placehold.co/100x100.png" },
  { id: "prof_new_1", name: "Dr. Sarah Miller", email: "sarahmiller@clinic.com", role: "professional", avatar: "https://placehold.co/100x100.png" },
  { id: "prof_new_2", name: "John Doe (Trainee)", email: "j.doe.trainee@medschool.edu", role: "professional", avatar: "https://placehold.co/100x100.png" },
  { id: "3", name: "Tech Solutions Inc.", email: "provider@example.com", role: "provider", avatar: "https://placehold.co/100x100.png" },
  { id: "prov_new_1", name: "XR Innovations Ltd.", email: "sales@xrinnovations.com", role: "provider", avatar: "https://placehold.co/100x100.png" },
  { id: "4", name: "Admin User", email: "admin@example.com", role: "admin", avatar: "https://placehold.co/100x100.png" }, // Admin might not manage other admins
];


export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<UserRole | "all">("hospital");

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Filter out admin users from being managed, unless we want admin to manage other admins
      setUsers(mockPlatformUsers.filter(u => u.role !== 'admin'));
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredUsers = users.filter(user => activeTab === "all" || user.role === activeTab);

  const handleViewDetails = (userId: string) => {
    toast({ title: "Action: View Details", description: `Viewing details for user ID: ${userId} (Not implemented)`});
  };

  const handleEditUser = (userId: string) => {
     toast({ title: "Action: Edit User", description: `Editing user ID: ${userId} (Not implemented)`});
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
            <UsersIcon className="mr-3 h-8 w-8" /> Manage Users
          </CardTitle>
          <CardDescription>View and manage platform users. Users are categorized by role.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole | "all")}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
              {/* <TabsTrigger value="all">All Users</TabsTrigger> */}
              <TabsTrigger value="hospital">Hospital Users</TabsTrigger>
              <TabsTrigger value="professional">Professionals</TabsTrigger>
              <TabsTrigger value="provider">Providers</TabsTrigger>
            </TabsList>
            
            {(["hospital", "professional", "provider"] as UserRole[]).map(roleType => (
              <TabsContent key={roleType} value={roleType}>
                {filteredUsers.filter(u => u.role === roleType).length === 0 ? (
                   <p className="text-muted-foreground text-center py-8">No {roleType} users found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.filter(u => u.role === roleType).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                          <TableCell className="hidden md:table-cell capitalize">{user.role}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(user.id)}>
                              <Eye className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Details</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user.id)}>
                              <Edit className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
