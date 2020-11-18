import { APIError } from "./APIError";
import { CampusId } from "./campus";

export interface ShortClassInfo {
  campus: CampusId;
  department: string;
  course: string;
  crn: number;
}

// TODO: I've only changed the fetch URLs, need to adapt the frontend to use the new API
export async function registerForClass(
  email: string,
  classInfo: ShortClassInfo,
): Promise<
  | [APIError, null]
  | [null, any]
> {
  // TODO: Verify request
  const res = await fetch("/api/registerClasses", {
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
    // Take result but for now ignore it cause we don't need it
    const { result } = await res.json();
    return [null, result];
  } else {
    try {
      const error = (await res.json()).error;
      return [new APIError(res.status, error), null];
    } catch (error) {
      return [new APIError(res.status, res.statusText), null];
    }
  }
}

export async function unregisterForClass(
  email: string,
  classInfo: ShortClassInfo,
): Promise<
  [APIError, null] | [null, any]
> {
  // TODO: Verify request
  const res = await fetch("/api/unregisterClasses", {
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
    try {
      const error = (await res.json()).error;
      return [new APIError(res.status, error), null];
    } catch (error) {
      return [new APIError(res.status, res.statusText), null];
    }
  }
}

export async function unregisterFromAllClasses(
  email: string,
): Promise<
  [APIError, null] | [null, any]
> {
  // TODO: Verify request
  const res = await fetch("/api/unregisterAllClasses", {
    method: "POST",
    body: JSON.stringify({
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
    try {
      const error = (await res.json()).error;
      return [new APIError(res.status, error), null];
    } catch (error) {
      return [new APIError(res.status, res.statusText), null];
    }
  }
}

export async function getUserClasses(
  email: string,
): Promise<[APIError, null] | [null, Array<ShortClassInfo>]> {
  const res = await fetch("/api/getUserClasses", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.ok === false) {
    try {
      const error = (await res.json()).error;
      return [new APIError(res.status, error), null];
    } catch (error) {
      return [new APIError(res.status, res.statusText), null];
    }
  }

  const classes = (await res.json()).result;

  if (classes === null || classes.length === 0) {
    return [null, null];
  }

  return [
    null,
    classes.map((classInfo) => ({
      ...classInfo,
      crn: parseInt(classInfo.crn),
      campus: classInfo.campus.toLowerCase(),
    })),
  ];
}
