import {
  RegistrationData,
  RegistrationResponse,
  StoredFullData,
  StoredClassData,
  ClassInfo,
} from "../data.ts";
import { db } from "../utilities/realdb.ts";

/**
 * Register the given email for updates from the given classes.
 * @param data The data containing the email to register and the classes to register to.
 */
export function register(
  data: RegistrationData,
): RegistrationResponse<"registered" | "duplicated"> {
  // Keep track of a list of classes
  const newlyRegisteredClasses: ClassInfo[] = [];

  // Loop through all the classes
  for (const classInfo of data.classes) {
    const path = [
      "registration",
      classInfo.campus,
      classInfo.department,
      classInfo.course,
      classInfo.CRN,
    ];

    // Get list of currently registered emails for the class
    const registeredEmails = db.get<StoredClassData>(path, true)?.registered ??
      [];

    // Register the email address into the class if not done already
    if (registeredEmails.includes(data.email) === false) {
      registeredEmails.push(data.email);
      newlyRegisteredClasses.push(classInfo);
    }

    // Apply changes
    db.set([...path, "registered"], registeredEmails);
  }

  // Get list of registered classes for the email
  const registeredClasses =
    db.get<StoredFullData["users"]>(["users"], true)?.[data.email] ??
      [];

  // Get a list of classes that were registered on the "registration" side,
  // so they can be also added to the email side (to avoid duplication)
  const classesToAdd = data.classes.filter((classRequested) =>
    newlyRegisteredClasses.some((classRegistered) =>
      classRequested.CRN === classRegistered.CRN &&
      classRequested.campus === classRegistered.campus &&
      classRequested.department === classRegistered.department &&
      classRequested.course === classRegistered.course
    ) === true
  );

  registeredClasses.push(...classesToAdd);
  db.set(["users", data.email], registeredClasses);

  return {
    result: data.classes.map((classRequested) => {
      // Check whether or not the class to be requested actually needed to be added
      const classNeededToBeAdded = classesToAdd.some((classRegistered) =>
        classRequested.CRN === classRegistered.CRN &&
        classRequested.campus === classRegistered.campus &&
        classRequested.department === classRegistered.department &&
        classRequested.course === classRegistered.course
      ) === true;

      return {
        type: classNeededToBeAdded
          ? "registered"
          : "duplicated",
        class: classRequested,
      };
    }),
  };
}
