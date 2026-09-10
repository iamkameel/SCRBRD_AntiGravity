"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DashboardFilters {
  seasonId: string;
  schoolId: string;
  simulatedRole?: string;
  activeDeckMode?: string;
}

interface DashboardContextType {
  filters: DashboardFilters;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<DashboardFilters>({
    seasonId: "all",
    schoolId: "all",
    simulatedRole: undefined,
    activeDeckMode: "operations",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem("scrbrd_dashboard_filters");
    if (savedFilters) {
      try {
        setFiltersState((prev) => ({ ...prev, ...JSON.parse(savedFilters) }));
      } catch (e) {
        console.error("Failed to parse saved filters", e);
      }
    }
    setIsLoading(false);
  }, []);

  const setFilters = (newFilters: Partial<DashboardFilters>) => {
    setFiltersState((prev) => {
      const updated = { ...prev, ...newFilters };
      localStorage.setItem("scrbrd_dashboard_filters", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <DashboardContext.Provider value={{ filters, setFilters, isLoading }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
