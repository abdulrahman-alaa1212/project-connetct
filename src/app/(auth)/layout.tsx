import { Logo } from "@/components/shared/Logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <main className="w-full max-w-md">{children}</main>
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Yura Connect. All rights reserved.
      </footer>
    </div>
  );
}
