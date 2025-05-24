import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b">
        <Logo />
      </header>
      <main className="flex-grow flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted">
        <div className="text-center max-w-2xl">
          <Image 
            src="https://placehold.co/600x300.png"
            alt="Abstract network graphic"
            data-ai-hint="abstract network"
            width={600}
            height={300}
            className="mx-auto mb-8 rounded-lg shadow-xl"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Welcome to Yura Connect
          </h1>
          <p className="text-lg text-foreground mb-8">
            Bridging the gap between healthcare innovation and skilled professionals. Discover tailored VR/MR/AR solutions and career opportunities.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Yura Connect. All rights reserved.
      </footer>
    </div>
  );
}
