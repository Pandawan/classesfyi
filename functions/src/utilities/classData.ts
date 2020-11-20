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

/**
 * Clean up and format the Class Data to an appropriate state for database
 * @param c Class Data to cleanup
 * @param withPreviousData Whether or not to include the previous data property
 */
export function cleanupClassData(
  c: ClassData,
  withPreviousData: boolean,
): ClassData {
  return {
    campus: c.campus.toLowerCase(),
    department: c.department.toLowerCase(),
    course: c.course.toLowerCase(),
    crn: c.crn,
    previous_data: (withPreviousData && c.previous_data
      ? {
        seats: c.previous_data.seats,
        waitlist_seats: c.previous_data.waitlist_seats,
        status: c.previous_data.status,
      }
      : undefined),
  };
}
