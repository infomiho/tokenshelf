import { format, parseISO } from "date-fns";

export const formatCalendarDate = (date: string | Date) =>
  format(typeof date === "string" ? parseISO(date) : date, "MMM d, yyyy");

export const formatDateTime = (date: Date) => format(date, "MMM d, yyyy 'at' h:mm a");
