export interface ClassInfo {
  campus: string;
  year: number;
  term: string;
  crn: number;
}

export const classInfoFormat =
  "{ campus: string, year: number, term: string, crn: number }";

export interface ClassData extends ClassInfo {
  previous_data?: {
    seats: number;
    waitlist_seats: number;
    status: "open" | "full" | "waitlist" | "unknown";
  };
}

/**
 * Checks if the given element is a ClassInfo object
 * @param c
 */
export function isClassInfo(c: any): c is ClassInfo {
  return (
    typeof c === "object" &&
    typeof c.campus === "string" && (c.campus !== "") &&
    typeof c.term === "string" && (c.term !== "") &&
    typeof c.year === "number" && c.year >= 2019 &&
    typeof c.crn === "number"
  );
}

/**
 * Checks if the given element is a ClassData object
 * @param c
 */
export function isClassData(c: any): c is ClassData {
  return isClassInfo(c);
}

/**
 * Clean up and format the Class Info to an appropriate state for database
 * @param c Class Info to cleanup
 */
export function cleanupClassInfo(
  c: ClassInfo,
): ClassInfo {
  return {
    campus: c.campus.trim().toLowerCase(),
    year: c.year,
    term: c.term.trim().toLowerCase(),
    crn: c.crn,
  };
}

/**
 * Clean up and format the Class Data to an appropriate state for database
 * @param c Class Data to cleanup
 */
export function cleanupClassData(
  c: ClassData,
): ClassData {
  return {
    campus: c.campus.trim().toLowerCase(),
    year: c.year,
    term: c.term.trim().toLowerCase(),
    crn: c.crn,
    previous_data: c.previous_data
      ? {
        seats: c.previous_data.seats,
        waitlist_seats: c.previous_data.waitlist_seats,
        status: c.previous_data.status,
      }
      : undefined,
  };
}
