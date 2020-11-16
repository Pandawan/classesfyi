import * as functions from "firebase-functions";
import got from "got";

import { store } from "./index";
import { ClassData, isClassData } from "./utilities/classData";
import { groupBy } from "./utilities/groupBy";
import { createSuccessResponse } from "./utilities/response";
import { sendEmail } from "./utilities/sendEmail";

/**
 * Register the given user for updates from the given classes.
 * 
 * Path: `/updateClassesData`
 * ```
 */
export const updateClassesData = functions.https.onRequest(
  async (request, response) => {
    // Update firestore data and get a list of all classes that have important changes
    const classesWithChanges = await getClassesWithImportantChanges();

    if (classesWithChanges.length === 0) {
      // TODO: Better response message
      response.send(createSuccessResponse("No class needed updates."));
      return;
    }

    const usersToBeUpdated: Record<string, ClassDataWithChanges[]> = {};

    // Loop through all classes that have changes,
    // and generate a record of users to be updated along with the changes to update them on
    for (const [classRef, classDataWithChanges] of classesWithChanges) {
      // Get all users that are registered to this specific class
      const usersRegisteredToClass = await store.collection("users").where(
        "registered_classes",
        "array-contains",
        classRef,
      ).get();
      if (usersRegisteredToClass.empty === true) break;

      // Loop through these users and add the ClassDataWithChanges to that user (data to be emailed)
      for (const registeredUser of usersRegisteredToClass.docs) {
        const email = registeredUser.id;
        if (usersToBeUpdated[email] === undefined) {
          usersToBeUpdated[email] = [classDataWithChanges];
        } else {
          usersToBeUpdated[email].push(classDataWithChanges);
        }
      }
    }

    const emailSendingReports = [];

    for (const email in usersToBeUpdated) {
      if (Object.prototype.hasOwnProperty.call(usersToBeUpdated, email)) {
        const classesToUpdateOn = usersToBeUpdated[email];

        emailSendingReports.push(
          // Attempt sending the email
          await sendEmailWithChanges(email, classesToUpdateOn),
        );
      }
    }

    functions.logger.log(
      "Successfully emailed users on their registered classes",
      usersToBeUpdated,
    );
    response.send(createSuccessResponse(emailSendingReports));
  },
);

type EmailReport = {
  type: "emailed";
  email: string;
} | {
  type: "error";
  email: string;
  error: string;
};

async function sendEmailWithChanges(
  email: string,
  classesWithChanges: ClassDataWithChanges[],
): Promise<EmailReport> {
  const formattedClassesWithChanges = classesWithChanges.map((
    classWithChanges,
  ) => ({
    name: `${classWithChanges.department} ${classWithChanges.course}`
      .toUpperCase(),
    crn: classWithChanges.crn,
    campus: classWithChanges.campus,
    changes: classWithChanges.changes
      .map((change) => {
        if (change.type === "seats") {
          if (change.updated === 1) {
            return `There is 1 seat available (was ${change.previous})`;
          } else {
            return `There are ${change.updated} seats available (was ${change.previous})`;
          }
        } else if (change.type === "status") {
          return `Class status is now ${change.updated} (was ${change.previous}).`;
        } else if (change.type === "waitlist_seats") {
          if (change.updated === 1) {
            return `There is 1 waitlist seat available (was ${change.previous})`;
          } else {
            return `There are ${change.updated} waitlist seats available (was ${change.previous})`;
          }
        } else {
          return undefined;
        }
      })
      .filter((formattedChange) => formattedChange !== undefined) as string[],
  }));

  const response = await sendEmail({
    email,
    classesData: groupBy(formattedClassesWithChanges, ((item) => item.campus)),
  });

  console.log(response);

  return (response[0].statusCode >= 200 && response[0].statusCode < 300)
    ? {
      type: "emailed",
      email,
    }
    : {
      type: "error",
      email,
      error: JSON.stringify(response[0].body),
    };
}

export interface ClassDataWithChanges extends ClassData {
  changes: ClassDataChange[];
}

async function getClassesWithImportantChanges() {
  const classesCollection = (await store.collection("classes").get()).docs;

  // A mapping of class reference and the changes since the previous update
  const classesChanges: [
    FirebaseFirestore.DocumentReference,
    ClassDataWithChanges,
  ][] = [];

  for (const classSnapshot of classesCollection) {
    const possibleClassData = classSnapshot.data();
    if (isClassData(possibleClassData) === false) {
      functions.logger.error(
        `Classes database contains invalid class data`,
        possibleClassData,
      );
      break;
    }

    const classData = possibleClassData as ClassData;

    // Get updated class data from OpenCourseAPI
    const updatedClassData = await getUpdatedClassData(
      classData.campus,
      classData.crn,
    );

    // Could not find class in OpenCourseAPI
    if (updatedClassData === null) {
      // TODO: Delete class & remove all refs from users
      break;
    }

    // Get a list of important changes
    const importantChanges = getImportantChanges(classData, updatedClassData);
    if (importantChanges.length !== 0) {
      const classDataWithChanges = {
        ...classData,
        changes: importantChanges,
      };
      // If there were important changes, add them to the complete list for all classes
      classesChanges.push([classSnapshot.ref, classDataWithChanges]);
    }

    // Update class's firestore data with new data from OpenCourseAPI
    await classSnapshot.ref.update({
      previous_data: {
        seats: updatedClassData.seats,
        waitlist_seats: updatedClassData.wait_seats,
        status: updatedClassData.status,
      },
    });
  }

  return classesChanges;
}

type ClassDataChange = {
  type: "seats" | "waitlist_seats";
  previous: number;
  updated: number;
} | {
  type: "status";
  previous: string;
  updated: string;
};

/**
 * Get a list of the important changes since the previous update for the given class data.
 * @param classData The current class data in firestore database
 * @param updatedClassData The updated class data from OpenCourseAPI
 */
function getImportantChanges(
  classData: ClassData,
  updatedClassData: OpenCourseClassData,
): ClassDataChange[] {
  const previousData = classData.previous_data;

  if (previousData === undefined) return [];

  const changes: ClassDataChange[] = [];

  // Seats is no longer 0
  if (
    previousData.seats !== updatedClassData.seats &&
    previousData.seats === 0 && updatedClassData.seats !== 0 &&
    updatedClassData.seats > 0
  ) {
    changes.push({
      type: "seats",
      previous: previousData.seats,
      updated: updatedClassData.seats,
    });
  }

  // Waitlist seats is no longer 0
  if (
    previousData.waitlist_seats !== updatedClassData.wait_seats &&
    previousData.waitlist_seats === 0 && updatedClassData.wait_seats !== 0 &&
    updatedClassData.wait_seats > 0
  ) {
    changes.push({
      type: "waitlist_seats",
      previous: previousData.waitlist_seats,
      updated: updatedClassData.wait_seats,
    });
  }

  // Status has changed and is not full anymore
  if (
    previousData.status !== updatedClassData.status.toLowerCase() &&
    updatedClassData.status.toLowerCase() !== "full"
  ) {
    changes.push({
      type: "status",
      previous: previousData.status,
      updated: updatedClassData.status,
    });
  }

  return changes;
}

interface OpenCourseClassData {
  CRN: number;
  raw_course: string;
  dept: string;
  course: string;
  section: string;
  title: string;
  units: number;
  start: string;
  end: string;
  seats: number;
  wait_seats: number;
  status: string;
  times: {
    days: string;
    start_time: string;
    end_time: string;
    instructor: string;
    location: string;
  }[];
}

/**
 * Get the latest class data from OpenCourseAPI for a given class.
 * @param campus The campus the class is in.
 * @param crn The CRN of the class.
 */
async function getUpdatedClassData(
  campus: string,
  crn: number,
): Promise<OpenCourseClassData | null>;
async function getUpdatedClassData(
  campus: string,
  crn: number,
  year: number,
  quarter: "summer" | "fall" | "winter" | "spring",
): Promise<OpenCourseClassData | null>;
async function getUpdatedClassData(
  campus: string,
  crn: number,
  year?: number,
  quarter?: "summer" | "fall" | "winter" | "spring",
): Promise<OpenCourseClassData | null> {
  const response = await got(
    `https://opencourse.dev/${campus}/classes/${crn}` +
      (year !== undefined && quarter !== undefined
        ? `?year=${year}&quarter=${quarter}`
        : ""),
    {
      responseType: "json",
    },
  );

  if (response.statusCode !== 200) {
    functions.logger.error(
      `Failed to get class data from OpenCourseAPI:`,
      response.statusMessage,
    );
    return null;
  }

  if (response.body === undefined || (response.body as any)?.CRN !== crn) {
    functions.logger.error(
      `Received invalid class data from OpenCourseAPI:`,
      response.body,
    );
    return null;
  }

  return response.body as OpenCourseClassData;
}
