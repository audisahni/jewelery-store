import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import { Toaster } from "@/components/ui/sonner";
import { EcommerceProvider } from "@/contexts/EcommerceContext";
import { getStoreSettings } from "@/lib/data";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
  // Default to OFF until explicitly enabled in Settings
  const ecommerceEnabled = settings.ecommerceEnabled === "true";
  const whatsappNumber = settings.whatsappNumber ?? "";

  return (
    <EcommerceProvider enabled={ecommerceEnabled} whatsappNumber={whatsappNumber}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster position="bottom-right" />
    </EcommerceProvider>
  );
}
