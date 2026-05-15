import Sidebar from "@/components/admin/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-60 min-h-screen">
        <main className="p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
