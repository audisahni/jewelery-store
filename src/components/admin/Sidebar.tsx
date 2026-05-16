"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Store,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 bg-foreground text-background z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-background/10">
          <span className="font-display text-xl tracking-wider text-background">
            EZMAY
          </span>
          <span className="font-body text-xs text-background/50 ml-2 uppercase tracking-widest">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body transition-colors relative",
                  active
                    ? "text-primary bg-background/10"
                    : "text-background/70 hover:text-background hover:bg-background/5"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
                )}
                <Icon size={18} className={active ? "text-primary" : ""} />
                {label}
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-background/10">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body text-background/70 hover:text-background hover:bg-background/5 transition-colors"
            >
              <Store size={18} />
              View Store
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="px-4 py-3 border-b border-background/10">
          <p className="text-xs font-body text-background/50 truncate">{userEmail}</p>
        </div>

        {/* Sign Out */}
        <div className="px-3 py-4 border-t border-background/10">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-body text-background/70 hover:text-background hover:bg-background/5 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-foreground border-t border-background/10 z-40 flex items-center justify-around px-1 py-1 safe-area-bottom">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors min-w-[52px]",
                active ? "text-primary" : "text-background/60 hover:text-background"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-body tracking-wide">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-md text-background/60 hover:text-background transition-colors min-w-[52px]"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-body tracking-wide">Sign Out</span>
        </button>
      </nav>
    </>
  );
}
