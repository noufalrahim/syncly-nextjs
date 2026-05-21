"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/core/utils";

const items = [
  { href: "/settings/members", label: "Members" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 border-b border-border/40 px-6 py-3">
      {items.map((i) => {
        const active = pathname === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            className={cn(
              "text-sm font-medium px-3 py-1.5 rounded-md transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

