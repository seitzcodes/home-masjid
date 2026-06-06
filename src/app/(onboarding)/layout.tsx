import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="h-16 border-b border-border bg-surface flex items-center px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Image
            src="/Home Masjid (Light BG).svg"
            alt="Home Masjid Logo"
            width={140}
            height={40}
            priority
            className="dark:hidden w-auto h-auto"
          />
          <Image
            src="/Home Masjid (Dark BG).svg"
            alt="Home Masjid Logo"
            width={140}
            height={40}
            priority
            className="hidden dark:block w-auto h-auto"
          />
        </div>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
