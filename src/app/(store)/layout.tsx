import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster position="bottom-right" />
    </>
  );
}
