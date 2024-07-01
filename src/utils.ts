import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseLocalisedDate = (date: string, location: string) => {
  if (location.includes("US")) {
    const [month, day, year] = date.split("/");
    return new Date(`${year}-${month}-${day}`).toISOString();
  }
  const [day, month, year] = date.split("/");
  return new Date(`${year}-${month}-${day}`).toISOString();
};
