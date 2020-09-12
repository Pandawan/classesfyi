import vs from "https://deno.land/x/value_schema@v3.0.0-rc.14/mod.ts";

export type Campus = "FH" | "DA";
export type Status = "Open" | "Full" | "Waitlist";

export function isValidCampus(str: string): str is Campus {
  return str === "FH" || str === "DA";
}

const classInfoSchema = {
  campus: vs.string({
    only: ["FH", "DA"],
  }),
  department: vs.string({
    pattern: /^[A-Z/]{2,4}$/,
  }),
  course: vs.string({
    pattern: /^[0-9]{1,3}[A-Z]{0,2}$/,
  }),
  CRN: vs.numericString(),
};
export interface ClassInfo {
  campus: Campus;
  department: string;
  course: string;
  CRN: string;
}
export function validateClassInfo(data: any): vs.ValueSchemaError[] {
  const messages: vs.ValueSchemaError[] = [];
  vs.applySchemaObject(classInfoSchema, data, (err) => {
    messages.push(err);
  });
  return messages;
}
export function sanitizeClassInfo(data: ClassInfo): ClassInfo {
  return {
    campus: data.campus,
    department: data.department,
    course: data.course,
    CRN: data.CRN.toString(),
  };
}

const registrationDataSchema = {
  email: vs.email(),
  classes: vs.array({
    minLength: 1,
    each: vs.object({ schemaObject: classInfoSchema }),
  }),
};
export interface RegistrationData {
  email: string;
  classes: ClassInfo[];
}

export function validateRegistrationData(data: any): vs.ValueSchemaError[] {
  const messages: vs.ValueSchemaError[] = [];
  vs.applySchemaObject(registrationDataSchema, data, (err) => {
    messages.push(err);
  });
  return messages;
}
export function sanitizeRegistrationData(
  data: RegistrationData
): RegistrationData {
  return {
    email: data.email,
    classes: data.classes.map((classInfo) => sanitizeClassInfo(classInfo)),
  };
}

export interface RegistrationResponse<ResponseTypes extends string> {
  result: Array<{
    type: ResponseTypes;
    class: ClassInfo;
  }>;
}

/**
 * Interface representing the full database
 */
export interface StoredFullData {
  registration: {
    [campus: string]: {
      [department: string]: {
        [course: string]: {
          [crn: string]: StoredClassData;
        };
      };
    };
  };
  users: {
    [email: string]: ClassInfo[];
  };
}

/**
 * Interface representing a single class's data in the full database
 */
export interface StoredClassData {
  registered: string[];
  previous: {
    wait_seats: number;
    seats: number;
    status: Status;
  };
}

/**
 * Interface with information about changes made to a specific class's information.
 */
export interface UpdatedClassData extends ClassInfo {
  changes: Array<
    | {
        type: "wait_seats";
        previous: number;
        new: number;
      }
    | {
        type: "seats";
        previous: number;
        new: number;
      }
    | {
        type: "status";
        previous: Status;
        new: Status;
      }
  >;
}

export interface UnformattedClassData {
  CRN: string;
  campus: string;
  course: string;
  days: string;
  desc: string;
  end: string;
  instructor: string;
  room: string;
  seats: string;
  start: string;
  status: string;
  time: string;
  units: string;
  wait_cap: string;
  wait_seats: string;
}

/**
 * Fomats the given group of unformatted class data into a singular class data with a schedule.
 * @param classDatas
 */
export function formatClassData(classDatas: UnformattedClassData[]): ClassData {
  let finalClassData: any = {
    ...classDatas[0],
    units: parseFloat(classDatas[0].units),
    seats: parseInt(classDatas[0].seats),
    wait_seats: parseInt(classDatas[0].wait_seats),
    wait_cap: parseInt(classDatas[0].wait_cap),
    schedule: classDatas.map((data) => ({ time: data.time, days: data.days })),
  };
  delete finalClassData["time"];
  delete finalClassData["days"];

  return finalClassData as ClassData;
}

export interface ClassData {
  /** CRN of the class */
  CRN: string;
  /** The campus this class is in */
  campus: Campus;
  /** The full ID of the course */
  course: string;
  /** The full title of the course */
  desc: string;
  /** The end date of the course */
  end: string;
  /** The name of the instructor for the course */
  instructor: string;
  /** The room this course is in */
  room: string;
  /** The schedule of meetings for the week */
  schedule: { time: string; days: string }[];
  /** The number of available seats */
  seats: number;
  /** The start date */
  start: string;
  /** The seating status */
  status: Status;
  /** The number of units this course offers */
  units: number;
  /** The maximum number of waitlist seats */
  wait_cap: number;
  /** The number of available waitlist seats */
  wait_seats: number;
}
