import { format, parseISO } from "date-fns";

export const formatCalendarDate = (date: string) => format(parseISO(date), "MMM d, yyyy");

export const formatDateTime = (date: Date) => format(date, "MMM d, yyyy 'at' h:mm a");
