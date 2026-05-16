"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Save, ShoppingCart, AlertCircle } from "lucide-react";

interface Settings {
  storeName: string;
  storeTagline: string;
  heroHeading: string;
  heroSubheading: string;
  heroCTA: string;
  contactEmail: string;
  whatsappNumber: string;
  shippingThreshold: string;
  shippingRate: string;
  aboutText: string;
  returnPolicy: string;
  instagramUrl: string;
  primaryColor: string;
  ecommerceEnabled: string;
}

const defaultSettings: Settings = {
  storeName: "EZMAY",
  storeTagline: "Handcrafted Artisan Indian Jewelry",
  heroHeading: "Born of\nTradition",
  heroSubheading: "Handcrafted artisan jewelry rooted in India's rich cultural heritage — each piece designed and made by Gurleen in New Delhi.",
  heroCTA: "View Collection",
  contactEmail: "",
  whatsappNumber: "",
  shippingThreshold: "5000",
  shippingRate: "299",
  aboutText: "EZMAY By Gurleen was born from a lifelong devotion to India's extraordinary jewelry-making heritage. Gurleen is a trained jewelry designer with over 15 years of professional experience — a career spent not only creating, but also teaching. As a professor, she has guided hundreds of aspiring designers, passing down the rare techniques of Kundan, Meenakari, Jadau, and contemporary Indian fusion.\n\nHer studio in New Delhi is where tradition meets creative vision. Every piece begins as a sketch in Gurleen's hand, progresses through patient handcrafting, and emerges finished with the pride of a true artisan.\n\nEZMAY is not just jewelry — it is a conversation between India's past and its present, designed to become the heirlooms of tomorrow.",
  returnPolicy: "We accept returns within 30 days of purchase, provided the piece is unworn and in its original packaging. Custom and made-to-order pieces are non-refundable. Please contact us on WhatsApp or email to initiate a return.",
  instagramUrl: "",
  primaryColor: "#C9A84C",
  ecommerceEnabled: "false",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch {}
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  const update =
    (key: keyof Settings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSettings(prev => ({ ...prev, [key]: e.target.value }));
    };

  const fieldClass =
    "w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent";
  const labelClass =
    "block font-accent text-xs tracking-wider uppercase text-muted mb-2";
  const hintClass = "font-body text-xs text-muted mt-1";
  const sectionClass = "bg-background border border-border p-6 space-y-4";

  const ecommerceOn = settings.ecommerceEnabled === "true";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Settings</h1>
          <p className="font-body text-sm text-muted mt-1">Configure your store</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-foreground text-background font-accent text-xs tracking-wider uppercase px-5 py-2.5 hover:bg-primary transition-colors disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">

          {/* E-Commerce Toggle — most important, shown first */}
          <div className={sectionClass}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className={ecommerceOn ? "text-primary" : "text-muted"} />
                <div>
                  <h2 className="font-display text-lg text-foreground">Online Shopping</h2>
                  <p className="font-body text-sm text-muted mt-0.5">
                    {ecommerceOn
                      ? "Customers can add items to cart and checkout."
                      : "Showcasing mode — customers can browse and enquire, but cannot purchase online."}
                  </p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                type="button"
                onClick={() =>
                  setSettings(prev => ({
                    ...prev,
                    ecommerceEnabled: prev.ecommerceEnabled === "true" ? "false" : "true",
                  }))
                }
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${
                  ecommerceOn ? "bg-primary" : "bg-border"
                }`}
                aria-pressed={ecommerceOn}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    ecommerceOn ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {!ecommerceOn && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 px-4 py-3 rounded-sm mt-2">
                <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="font-body text-xs text-amber-700">
                  Shopping is currently <strong>off</strong>. The cart icon is hidden and product pages show
                  an enquiry button instead of "Add to Cart". Turn this on when you&apos;re ready to sell online.
                </p>
              </div>
            )}
          </div>

          {/* Store Identity */}
          <div className={sectionClass}>
            <h2 className="font-display text-lg text-foreground border-b border-border pb-3 mb-4">
              Store Identity
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Store Name</label>
                <input
                  className={fieldClass}
                  value={settings.storeName}
                  onChange={update("storeName")}
                  placeholder="EZMAY"
                />
              </div>
              <div>
                <label className={labelClass}>Tagline</label>
                <input
                  className={fieldClass}
                  value={settings.storeTagline}
                  onChange={update("storeTagline")}
                  placeholder="Handcrafted Artisan Indian Jewelry"
                />
              </div>
              <div>
                <label className={labelClass}>Contact Email</label>
                <input
                  type="email"
                  className={fieldClass}
                  value={settings.contactEmail}
                  onChange={update("contactEmail")}
                  placeholder="hello@ezmay.in"
                />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input
                  type="tel"
                  className={fieldClass}
                  value={settings.whatsappNumber}
                  onChange={update("whatsappNumber")}
                  placeholder="+91 98765 43210"
                />
                <p className={hintClass}>
                  Used for the &quot;Enquire on WhatsApp&quot; button on product pages. Include country code (e.g. +91).
                </p>
              </div>
              <div>
                <label className={labelClass}>Brand Color</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={update("primaryColor")}
                    className="h-10 w-16 cursor-pointer border border-border p-1 bg-transparent"
                  />
                  <input
                    className={fieldClass}
                    value={settings.primaryColor}
                    onChange={update("primaryColor")}
                    placeholder="#C9A84C"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Instagram URL</label>
                <input
                  className={fieldClass}
                  type="url"
                  value={settings.instagramUrl}
                  onChange={update("instagramUrl")}
                  placeholder="https://instagram.com/ezmay.bygurleen"
                />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className={sectionClass}>
            <h2 className="font-display text-lg text-foreground border-b border-border pb-3 mb-4">
              Homepage Hero
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Hero Heading</label>
                <textarea
                  className={fieldClass}
                  rows={2}
                  value={settings.heroHeading}
                  onChange={update("heroHeading")}
                  placeholder={"Born of\nTradition"}
                />
                <p className={hintClass}>
                  Use a new line to split across two lines on the homepage.
                </p>
              </div>
              <div>
                <label className={labelClass}>Hero Subheading</label>
                <textarea
                  className={fieldClass}
                  rows={3}
                  value={settings.heroSubheading}
                  onChange={update("heroSubheading")}
                />
              </div>
              <div>
                <label className={labelClass}>CTA Button Text</label>
                <input
                  className={fieldClass}
                  value={settings.heroCTA}
                  onChange={update("heroCTA")}
                  placeholder="View Collection"
                />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className={sectionClass}>
            <h2 className="font-display text-lg text-foreground border-b border-border pb-3 mb-4">
              Shipping
            </h2>
            <p className={hintClass + " mb-4"}>All amounts in Indian Rupees (₹).</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Free Shipping Above (₹)</label>
                <input
                  type="number"
                  className={fieldClass}
                  value={settings.shippingThreshold}
                  onChange={update("shippingThreshold")}
                  placeholder="5000"
                />
              </div>
              <div>
                <label className={labelClass}>Flat Shipping Rate (₹)</label>
                <input
                  type="number"
                  className={fieldClass}
                  value={settings.shippingRate}
                  onChange={update("shippingRate")}
                  placeholder="299"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={sectionClass}>
            <h2 className="font-display text-lg text-foreground border-b border-border pb-3 mb-4">
              Content
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>About / Our Story</label>
                <textarea
                  className={fieldClass}
                  rows={8}
                  value={settings.aboutText}
                  onChange={update("aboutText")}
                  placeholder="Tell Gurleen's story..."
                />
              </div>
              <div>
                <label className={labelClass}>Return Policy</label>
                <textarea
                  className={fieldClass}
                  rows={4}
                  value={settings.returnPolicy}
                  onChange={update("returnPolicy")}
                />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
