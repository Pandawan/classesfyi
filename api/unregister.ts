import {
  RegistrationData,
  RegistrationResponse,
  StoredClassData,
  ClassInfo,
} from "../data.ts";
import { db } from "../utilities/realdb.ts";

/**
 * Unregister the given email from the given classes.
 * @param data The data containing the email to unregister and the classes to unregister from.
 */
export function unregister(
  data: RegistrationData,
): RegistrationResponse<"unregistered"> {
  for (const classInfo of data.classes) {
    const path = [
      "registration",
      classInfo.campus,
      classInfo.department,
      classInfo.course,
      classInfo.CRN,
    ];

    const registeredEmails = db.get<StoredClassData["registered"]>(
      [...path, "registered"],
      false,
    );
    // If there are registered emails for the given class (which it should if the input is valid)
    if (registeredEmails) {
      // Remove the email from the list
      const newRegisteredEmails = registeredEmails.filter((email) =>
        email !== data.email
      );
      // If the list is now empty, can remove the entire class (clean up after itself)
      if (newRegisteredEmails.length === 0) {
        db.set(path, undefined);
      } // If the list is not empty, set the new list in place
      else {
        db.set([...path, "registered"], newRegisteredEmails);
      }
    }
  }

  const userClasses = db.get<ClassInfo[]>(["users", data.email], false);
  if (userClasses) {
    // Get a new list of classes by removing those that need to be unregistered (from data.classes)
    const newUserClasses = userClasses.filter((currentClass) =>
      data.classes.some((classToUnregister) =>
        classToUnregister.CRN === currentClass.CRN &&
        classToUnregister.campus === currentClass.campus &&
        classToUnregister.department === currentClass.department &&
        classToUnregister.course === currentClass.course
      ) === false
    );
    // If the list is now empty, can remove the entire user (clean up after itself)
    if (newUserClasses.length === 0) {
      db.set(["users", data.email], undefined);
    } // If the list is not empty, set the new list in place
    else {
      db.set(["users", data.email], newUserClasses);
    }
  }

  return {
    result: data.classes.map((classInfo) => ({
      type: "unregistered",
      class: classInfo,
    })),
  };
}

/**
 * Unregister the given email from all the classes it is currently registered to.
 * @param email The email to unregister all classes from.
 */
export function unregisterAll(email: string) {
  const classes: ClassInfo[] = db.get(["users", email]) ?? [];
  return unregister({ email, classes });
}
