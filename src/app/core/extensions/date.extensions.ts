import { format } from "date-fns";

export function formatLocalISO(date: Date): string {
  return date.toISOString();
}