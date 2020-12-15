import { APIError } from "./APIError";
import { CampusId } from "./campus";

/* -------------------------------------
    TERM
------------------------------------- */
interface TermData {
  year: number;
  term: "summer" | "fall" | "winter" | "spring";
  code: string;
}

export async function getCurrentTermData(
  campusId: CampusId,
): Promise<[APIError, null] | [null, TermData]> {
  const res = await fetch(`https://opencourse.dev/${campusId}/`);

  if (res.status === 200) {
    const data = await res.json();

    const currentTermData = data.current;
    return [null, currentTermData];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/* -------------------------------------
    DEPARTMENT
------------------------------------- */

export interface DepartmentInfo {
  id: string;
  name: string;
}

/**
 * Get an array of all departments available in the given campus.
 */

export async function getCampusDepartments(
  campusId: CampusId,
  year?: number,
  term?: string,
): Promise<[APIError, null] | [null, Array<DepartmentInfo>]> {
  let url = `https://opencourse.dev/${campusId}/depts`;
  if (year !== undefined && term !== undefined) {
    url += `?year=${year}&quarter=${term}`;
  }

  const res = await fetch(url);

  if (res.status === 200) {
    const data = await res.json();
    return [null, data];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/**
 * Get relevant information about a given deparment at the given campus.
 */
export async function getDepartmentInfo(
  campusId: CampusId,
  departmentId: string,
  year?: number,
  term?: string,
): Promise<[APIError, null] | [null, DepartmentInfo]> {
  let url = `https://opencourse.dev/${campusId}/depts/${departmentId}`;
  if (year !== undefined && term !== undefined) {
    url += `?year=${year}&quarter=${term}`;
  }

  const res = await fetch(url);

  if (res.status === 200) {
    const data = await res.json();
    return [null, data];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/* -------------------------------------
    COURSES
------------------------------------- */

export interface CourseInfo {
  campus: CampusId;
  department: string;
  course: string;
  title: string;
  classes: string[];
}

/**
 * Get an array of all courses available in the given department at the given campus.
 */

export async function getDepartmentCourses(
  campusId: CampusId,
  departmentId: string,
  year?: number,
  term?: string,
): Promise<[APIError, null] | [null, CourseInfo[]]> {
  let url = `https://opencourse.dev/${campusId}/depts/${departmentId}/courses`;
  if (year !== undefined && term !== undefined) {
    url += `?year=${year}&quarter=${term}`;
  }

  const res = await fetch(url);

  if (res.status === 200) {
    const data = await res.json();
    return [
      null,
      data.map((courseInfo: any) => ({
        ...courseInfo,
        department: courseInfo.dept,
        campus: campusId,
      })),
    ];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/**
 * Get relevant information about a given course for a given department at the given campus.
 */
export async function getCourseInfo(
  campusId: CampusId,
  departmentId: string,
  courseId: string,
  year?: number,
  term?: string,
): Promise<[APIError, null] | [null, CourseInfo]> {
  let url =
    `https://opencourse.dev/${campusId}/depts/${departmentId}/courses/${courseId}`;
  if (year !== undefined && term !== undefined) {
    url += `?year=${year}&quarter=${term}`;
  }
  const res = await fetch(url);

  if (res.status === 200) {
    const data = await res.json();
    return [null, data];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/* -------------------------------------
    COURSES
------------------------------------- */

export type ClassStatus = "open" | "waitlist" | "full" | "unknown";

export interface ClassInfo {
  /** Class's CRN */
  CRN: number;
  /** Full identifier for the class */
  raw_course: string;
  /** Campus */
  campus: CampusId;
  /** Department */
  department: string;
  /** Course */
  course: string;
  /** Section */
  section: string;
  /** Title of the course */
  title: string;
  /** Units */
  units: number;
  /** Start date "MM/DD/YYYY" */
  start: string;
  /** End date "MM/DD/YYYY" */
  end: string;
  /** Number of seats open */
  seats: number;
  /** Number of waitlist seats open */
  wait_seats: number;
  /** Status of the class */
  status: ClassStatus;
  /** Schedule for the class */
  times: {
    /** Type of class this time represents */
    type: string;
    /** Days this class runs */
    days: string;
    /** Time the class starts "hh:mm a" */
    start_time: string;
    /** Time the class ends */
    end_time: string;
    /** List of instructors */
    instructor: string[];
    /** Location */
    location: string;
  }[];
}

/**
 * Get an array of all classes available for the given course in the given department at the given campus.
 */
export async function getCourseClasses(
  campusId: CampusId,
  departmentId: string,
  courseId: string,
  year?: number,
  term?: string,
): Promise<[APIError, null] | [null, ClassInfo[]]> {
  let url =
    `https://opencourse.dev/${campusId}/depts/${departmentId}/courses/${courseId}/classes`;
  if (year !== undefined && term !== undefined) {
    url += `?year=${year}&quarter=${term}`;
  }
  const res = await fetch(url);

  if (res.status === 200) {
    const data = await res.json();
    return [
      null,
      data.map((classInfo: any) => ({
        ...classInfo,
        department: classInfo.dept,
        campus: campusId.toLowerCase(),
      })),
    ];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/**
 * Get info about a specific class.
 */
export async function getClassInfo(
  campusId: CampusId,
  CRN: number,
  year?: number,
  term?: string,
): Promise<[APIError, null] | [null, ClassInfo | undefined]> {
  let url = `https://opencourse.dev/${campusId}/classes/${CRN}`;
  if (year !== undefined && term !== undefined) {
    url += `?year=${year}&quarter=${term}`;
  }
  const res = await fetch(url);

  if (res.status === 200) {
    const classInfo = await res.json();
    return [
      null,
      {
        ...classInfo,
        department: classInfo.dept,
        campus: campusId.toLowerCase(),
      },
    ];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/**
 * Get info about all the classes in the CRN list.
 * @param campusId Campus id
 * @param CRNs List of CRNs to look for
 */
export async function getClassesInfo(
  campusId: CampusId,
  CRNs: number[],
  year?: number,
  term?: string,
): Promise<
  [APIError, null] | [
    null,
    Array<
      | { status: "success"; data: ClassInfo }
      | { status: "error"; error: string }
    >,
  ]
> {
  let url = `https://opencourse.dev/${campusId}/classes`;
  if (year !== undefined && term !== undefined) {
    url += `?year=${year}&quarter=${term}`;
  }

  const res = await fetch(url, {
    method: "post",
    body: JSON.stringify({
      resources: CRNs.map((crn) => ({
        CRN: crn,
      })),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status === 200) {
    const response = await res.json();

    if (
      response?.resources === undefined ||
      Array.isArray(response.resources) === false
    ) {
      return [new APIError(res.status, "No resources found"), null];
    }

    return [
      null,
      response.resources.map((classResult) => {
        if (classResult.status === "error" || classResult.data === null) {
          return classResult;
        }

        const classInfo = {
          ...classResult.data,
          department: classResult.data.dept,
          campus: campusId.toLowerCase(),
        };
        return {
          ...classResult,
          data: classInfo,
        };
      }),
    ];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}
