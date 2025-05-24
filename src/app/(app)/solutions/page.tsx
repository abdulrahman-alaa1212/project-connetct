
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SolutionsPage() {
  // This page is linked from the Hospital dashboard "View Solution Matches".
  // Its functionality needs further definition.
  // For now, it's a placeholder. It could eventually show a consolidated view of all AI solution matches
  // for all of the hospital's assessments, or allow re-triggering matches.

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
            <Lightbulb className="mr-3 h-8 w-8" /> AI-Powered Solution Matches
          </CardTitle>
          <CardDescription>
            Explore VR/AR/MR solutions recommended by our AI based on your hospital's needs assessments.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <Lightbulb className="mx-auto h-16 w-16 text-primary opacity-50 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Feature Under Development</h3>
          <p className="text-muted-foreground mb-4">
            This page will soon provide a consolidated view of all AI-suggested solutions tailored to your submitted assessments.
          </p>
          <p className="text-muted-foreground">
            For now, you can view AI summaries and solution matches immediately after submitting a new assessment,
            or by viewing details of your past submissions on the {" "}
            <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/my-assessments">My Assessments</Link>
            </Button>
            {" "}page.
          </p>
           <Button asChild className="mt-6">
             <Link href="/assessment">Submit a New Assessment</Link>
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
