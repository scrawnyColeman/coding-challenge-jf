import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const humanizeDate = (date: string, location: string) => {
  // US
  if (location.includes("US")) {
    const [month, day, year] = date.split("/");
    return format(new Date(`${year}-${month}-${day}`), "do MMM yyyy");
  }

  // Europe
  const [day, month, year] = date.split("/");
  return format(new Date(`${year}-${month}-${day}`), "do MMM yyyy");
};
