import { auth } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userEmail={session.user.email ?? ""} />
      <div className="md:pl-60 min-h-screen">
        <main className="p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
