"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface Settings {
  storeName: string;
  storeTagline: string;
  heroHeading: string;
  heroSubheading: string;
  heroCTA: string;
  contactEmail: string;
  shippingThreshold: string;
  shippingRate: string;
  aboutText: string;
  returnPolicy: string;
  instagramUrl: string;
  primaryColor: string;
}

const defaultSettings: Settings = {
  storeName: "Lumière",
  storeTagline: "Fine Jewelry for the Discerning",
  heroHeading: "Crafted for\nEternity",
  heroSubheading: "Discover our collection of handcrafted fine jewelry.",
  heroCTA: "Explore Collection",
  contactEmail: "",
  shippingThreshold: "500",
  shippingRate: "25",
  aboutText: "We are passionate about fine jewelry.",
  returnPolicy: "We accept returns within 30 days of purchase.",
  instagramUrl: "",
  primaryColor: "#C9A84C",
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
  const sectionClass = "bg-background border border-border p-6 space-y-4";

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
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
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
                  placeholder="Lumière"
                />
              </div>
              <div>
                <label className={labelClass}>Tagline</label>
                <input
                  className={fieldClass}
                  value={settings.storeTagline}
                  onChange={update("storeTagline")}
                  placeholder="Fine Jewelry for the Discerning"
                />
              </div>
              <div>
                <label className={labelClass}>Contact Email</label>
                <input
                  type="email"
                  className={fieldClass}
                  value={settings.contactEmail}
                  onChange={update("contactEmail")}
                  placeholder="hello@yourdomain.com"
                />
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
                  placeholder={"Crafted for\nEternity"}
                />
                <p className="text-xs text-muted mt-1">
                  Use a newline to split across two lines
                </p>
              </div>
              <div>
                <label className={labelClass}>Hero Subheading</label>
                <textarea
                  className={fieldClass}
                  rows={2}
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
                  placeholder="Explore Collection"
                />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className={sectionClass}>
            <h2 className="font-display text-lg text-foreground border-b border-border pb-3 mb-4">
              Shipping
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Free Shipping Threshold ($)</label>
                <input
                  type="number"
                  className={fieldClass}
                  value={settings.shippingThreshold}
                  onChange={update("shippingThreshold")}
                  placeholder="500"
                />
              </div>
              <div>
                <label className={labelClass}>Flat Shipping Rate ($)</label>
                <input
                  type="number"
                  className={fieldClass}
                  value={settings.shippingRate}
                  onChange={update("shippingRate")}
                  placeholder="25"
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
                <label className={labelClass}>About Us Text</label>
                <textarea
                  className={fieldClass}
                  rows={5}
                  value={settings.aboutText}
                  onChange={update("aboutText")}
                />
              </div>
              <div>
                <label className={labelClass}>Return Policy</label>
                <textarea
                  className={fieldClass}
                  rows={3}
                  value={settings.returnPolicy}
                  onChange={update("returnPolicy")}
                />
              </div>
              <div>
                <label className={labelClass}>Instagram URL</label>
                <input
                  className={fieldClass}
                  type="url"
                  value={settings.instagramUrl}
                  onChange={update("instagramUrl")}
                  placeholder="https://instagram.com/yourbrand"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
