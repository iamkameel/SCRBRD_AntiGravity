import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely serializes data fetched on the server (e.g. from Firestore)
 * into plain JSON objects for React Server Component -> Client Component prop passing.
 * Converts Timestamps and strips non-serializable methods/prototypes.
 */
export function serializeForClient<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}
