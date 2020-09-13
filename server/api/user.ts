import { ClassInfo } from "./data.ts";
import { db } from "./utilities/realdb.ts";

/**
 * Get a list of all classes a user has registered for
 */
export function getUserClasses(email: string) {
  const classes = db.get<ClassInfo[] | undefined>(["users", email], false);
  return classes;
}
