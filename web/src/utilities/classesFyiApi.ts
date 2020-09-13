import { APIError } from "./APIError";
import { CampusId } from "./campus";

export interface ShortClassInfo {
  campus: CampusId;
  department: string;
  course: string;
  CRN: number;
}

export async function registerForClass(
  email: string,
  classInfo: ShortClassInfo
): Promise<
  | [APIError, null]
  | [null, { type: "registered" | "duplicated"; class: ShortClassInfo }[]]
> {
  // TODO: Verify request
  const res = await fetch("/api/register", {
    method: "POST",
    body: JSON.stringify({
      classes: [classInfo],
      email,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.ok) {
    const { result } = await res.json();
    return [null, result];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

export async function getUserClasses(
  email: string
): Promise<[APIError, null] | [null, Array<ShortClassInfo>]> {
  const res = await fetch("/api/user", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.ok === false) {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }

  const { classes } = await res.json();

  return [
    null,
    classes.map((classInfo) => ({
      ...classInfo,
      CRN: parseInt(classInfo.CRN),
    })),
  ];
}
