"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Activity } from "lucide-react";
import { Fragment } from "react";
import { D } from "@/lib/design-system";

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Map of route segments to human-readable labels
const segmentLabels: Record<string, string> = {
  home: "Dashboard",
  matches: "Matches",
  teams: "Teams",
  people: "People",
  schools: "Schools",
  fields: "Fields",
  equipment: "Equipment",
  financials: "Financials",
  transport: "Transport",
  analytics: "Analytics",
  "user-management": "User Management",
  settings: "Settings",
  leagues: "Leagues",
  divisions: "Divisions",
  seasons: "Seasons",
  edit: "Edit",
  new: "New",
  create: "Create",
};

// Special handling for dynamic routes
const getDynamicLabel = (segment: string, index: number, segments: string[]): string => {
  if (segment.match(/^[a-z0-9-]{20,}$/i) || segment.match(/^[a-z]\d+$/i)) {
    const parentSegment = segments[index - 1];
    if (parentSegment === "matches") return "Match Details";
    if (parentSegment === "teams") return "Team Details";
    if (parentSegment === "people") return "Person Details";
    if (parentSegment === "schools") return "School Details";
    if (parentSegment === "fields") return "Field Details";
    if (parentSegment === "equipment") return "Equipment Details";
    if (parentSegment === "financials") return "Transaction Details";
    if (parentSegment === "leagues") return "League Details";
    if (parentSegment === "divisions") return "Division Details";
    return "Details";
  }
  
  return segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on public pages or home
  if (!pathname || pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/home" },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    if (currentPath === "/home") return;

    const label = getDynamicLabel(segment, index, segments);
    breadcrumbs.push({
        label,
        href: currentPath,
    });
  });

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6 px-1">
      <ol className="flex items-center space-x-3 overflow-x-auto no-scrollbar scroll-smooth">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <Fragment key={crumb.href}>
              <li className="flex items-center shrink-0">
                {isLast ? (
                  <span 
                    className="flex items-center gap-2 text-xs font-medium" 
                    style={{ fontFamily: D.head, color: D.textPrimary }}
                  >
                    {isFirst ? <Home size={11} className="text-indigo-500" /> : <div className="w-1.5 h-1.5 rounded-full" style={{ background: D.indigo }} />}
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="flex items-center gap-2 text-xs font-medium transition-all hover:text-indigo-500 hover:opacity-100"
                    style={{ fontFamily: D.head, color: D.textMuted }}
                  >
                    {isFirst && <Home size={11} />}
                    {crumb.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <ChevronRight size={10} className="opacity-20 translate-y-[-0.5px]" style={{ color: D.textMuted }} />
              )}
            </Fragment>
          );
        })}
      </ol>
      <div className="h-px w-full mt-3 opacity-5" style={{ background: `linear-gradient(90deg, ${D.indigo}, transparent)` }} />
    </nav>
  );
}
