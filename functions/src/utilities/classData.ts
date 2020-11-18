export interface ClassData {
  campus: string;
  department: string;
  course: string;
  crn: number;

  previous_data?: {
    seats: number;
    waitlist_seats: number;
    status: "open" | "full" | "waitlist" | "unknown";
  };
}

/**
 * Checks if the given element is a ClassData object
 * @param c
 */
export function isClassData(c: any): c is ClassData {
  return (
    typeof c === "object" &&
    typeof c.campus === "string" &&
    typeof c.department === "string" &&
    typeof c.course === "string" &&
    typeof c.crn === "number"
  );
}
