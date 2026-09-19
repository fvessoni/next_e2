"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

type NavItem = { name: string; href: string };

type NavGroup = {
  id: string;
  label: string;
  icon: ReactNode;
  items: NavItem[];
  adminOnly?: boolean;
};

function BotIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function isItemActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroupSection({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        {group.icon}
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul className="relative mt-0.5 ml-3.5 border-l border-border pl-3">
          {group.items.map((item) => {
            const isActive = isItemActive(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const platformGroups: NavGroup[] = [
  {
    id: "admin",
    label: "Admin",
    icon: <BotIcon />,
    adminOnly: true,
    items: [{ name: "Usuários", href: "/users" }],
  },
];

export function SidebarNav({ showAdmin }: { showAdmin: boolean }) {
  const groups = platformGroups.filter(
    (group) => !group.adminOnly || showAdmin,
  );

  return (
    <nav className="space-y-1">
      {groups.map((group) => (
        <NavGroupSection key={group.id} group={group} />
      ))}
    </nav>
  );
}
