"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

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
  // If it's a UUID or ID-like segment, try to infer from context
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

  // Parse pathname into segments
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/home" },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip if path is /home to avoid duplicate keys (Home is already added)
    if (currentPath === "/home") return;

    const label = getDynamicLabel(segment, index, segments);
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  // Don't show if only home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <Fragment key={crumb.href}>
              <li className="flex items-center">
                {isLast ? (
                  <span className="font-medium text-foreground flex items-center">
                    {isFirst && <Home className="h-4 w-4 mr-1" />}
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors flex items-center"
                  >
                    {isFirst && <Home className="h-4 w-4 mr-1" />}
                    {crumb.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
