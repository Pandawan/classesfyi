import * as functions from "firebase-functions";
import got from "got";

import { store } from "./index";
import { ClassData, ClassInfo, cleanupClassInfo } from "./utilities/classData";
import { groupBy } from "./utilities/groupBy";
import { sendEmail } from "./utilities/sendEmail";
import { uniqWith } from "./utilities/uniqWith";

export const test = functions.https.onRequest(async (req, res) => {
  await updateClassesData.run(undefined, undefined);
  res.send("Done");
});

/**
 * Update the class data for classes that are registered 
 * and send emails to those registered if necessary.
 * 
 * This is a pubsub scheduled job, which is automatically handled by Firebase 
 * and is run every 15 minutes based on the given schedule.
 */
export const updateClassesData = functions.pubsub.schedule("every 20 minutes")
  .onRun(
    async (context) => {
      // Update firestore data and get a list of all classes that have important changes
      const classesWithChanges = await getClassesWithImportantChanges();

      if (classesWithChanges.length === 0) {
        functions.logger.log("No class needed updates.");
        return;
      }

      const usersToBeUpdated: Record<string, ClassDataWithChanges[]> = {};

      // Loop through all classes that have changes,
      // and generate a record of users to be updated along with the changes to update them on
      for (const classDataWithChanges of classesWithChanges) {
        // Get all users that are registered to this specific class
        const usersRegisteredToClass = await store.collection("users").where(
          "registered_classes",
          "array-contains",
          // Only keep the class info to match with user
          cleanupClassInfo(classDataWithChanges),
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
        "Attempted to email users on their registered classes",
        JSON.stringify(usersToBeUpdated),
        "\nEmail Reports: ",
        JSON.stringify(emailSendingReports),
      );
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
  ) => {
    const { changes, wait_cap } = classWithChanges;
    // Special case if seat > 0 & class open (implies that waitlist is 0 b/c it wouldn't be closed otherwise)
    // This means a waitlist seat is about to open up
    // TODO: Need a way to know if waitlist is truly 0 (perhaps changes can keep track of "important" vs "unimportant"?)
    if (
      changes.seats !== undefined &&
      changes.seats.updated > 0 &&
      wait_cap !== 0 &&
      changes.status !== undefined &&
      changes.status.updated === "open"
    ) {
      return {
        name: `${classWithChanges.department} ${classWithChanges.course}`
          .toUpperCase(),
        crn: classWithChanges.crn,
        campus: classWithChanges.campus,
        changes: [
          "One or more seats are about to open up in the waitlist (within the next hour or so). We'll email you again once they do.",
        ],
      };
    }

    // Otherwise return a report of all the changes
    return {
      name: `${classWithChanges.department} ${classWithChanges.course}`
        .toUpperCase(),
      crn: classWithChanges.crn,
      campus: classWithChanges.campus,
      // TODO: Move this to another function
      changes: Object.entries(changes)
        .map(([type, change]) => {
          // Skip over undefined values
          if (change === undefined) {
            return undefined;
          }
          // Description of seats change
          if (type === "seats") {
            if (change.updated === 1) {
              return `There is 1 seat available (was ${change.previous})`;
            } else {
              return `There are ${change.updated} seats available (was ${change.previous})`;
            }
          }
          // Description of status change
          if (type === "status") {
            return `Class status is now ${change.updated} (was ${change.previous}).`;
          }
          // Description of waitlist change
          if (type === "waitlist_seats") {
            if (change.updated === 1) {
              return `There is 1 waitlist seat available (was ${change.previous})`;
            } else {
              return `There are ${change.updated} waitlist seats available (was ${change.previous})`;
            }
          }

          return undefined;
        })
        .filter((formattedChange) => formattedChange !== undefined) as string[],
    };
  });

  const emailData = groupBy(
    formattedClassesWithChanges,
    ((item) => item.campus),
  );
  const response = await sendEmail({
    email,
    classesData: emailData,
    campusNames: {
      "da": "De Anza",
      "fh": "Foothill",
    },
  });

  return (response.type === "success")
    ? {
      type: "emailed",
      email,
    }
    : {
      type: "error",
      email,
      error: JSON.stringify(response.error),
    };
}

export interface ClassDataWithChanges extends ClassData {
  department: string;
  course: string;
  wait_cap: number;
  changes: ClassDataChanges;
}

async function getClassesWithImportantChanges() {
  const classesCollection = await getAllClasses();

  // A mapping of class reference and the changes since the previous update
  const classesChanges: ClassDataWithChanges[] = [];

  // Group the classes by campus, year, and term so each can have its own batch request
  const currentClassesByCampusAndYearAndTerm = groupBy(
    classesCollection,
    (snapshot) => snapshot.campus + snapshot.year + snapshot.term,
  );

  // TODO: Run this as a Promise.all(tasks) instead to optimize
  // TODO: this could be optimized by storing classes by CRN in a map rather than as an array
  for (
    const classInfos of Object.values(
      currentClassesByCampusAndYearAndTerm,
    )
  ) {
    const { campus, year, term } = classInfos[0];

    // Get all the data for that given campus
    const updatedClassesData = await getUpdatedClassesData(
      campus,
      classInfos,
      year,
      term as "summer" | "fall" | "winter" | "spring",
    );

    if (updatedClassesData === null) {
      functions.logger.error("No data found for campus", campus);
      break;
    }

    // Loop through all classes
    for (
      const [index, updatedClassDataResponse] of updatedClassesData.entries()
    ) {
      if (updatedClassDataResponse.status === "error") {
        functions.logger.error(
          "Encountered an error while fetching updated class data for a specific class",
          updatedClassDataResponse.error,
        );
        break;
      } else if (
        updatedClassDataResponse.data === null ||
        updatedClassDataResponse.data === undefined
      ) {
        functions.logger.error(
          "Encountered an error while fetching updated class data for a specific class",
          "class data was null (it likely does not exist on OpenCourseAPI)",
        );
        break;
      }

      const updatedClassData = updatedClassDataResponse.data;

      // Find the class pair that matches with the updated class data (by index since the API returns in the same order)
      const currentClassSnapshotQuery = await store.collection("classes")
        .where("campus", "==", classInfos[index].campus)
        .where("year", "==", classInfos[index].year)
        .where("term", "==", classInfos[index].term)
        .where("crn", "==", classInfos[index].crn)
        .get();

      // TODO: Handle more than one?
      // TODO: If did based on subcollections, this would not be an issue
      let currentClassSnapshot: FirebaseFirestore.DocumentSnapshot =
        currentClassSnapshotQuery.docs[0];

      // If no class was found, need to create a new one
      if (currentClassSnapshotQuery.empty) {
        const newClassRef = store.collection("classes").doc();
        // Create a new document with the basic class info
        await newClassRef.create(classInfos[index]);
        // Set it as current class snapshot
        currentClassSnapshot = await newClassRef.get();
      } else if (currentClassSnapshotQuery.size > 1) {
        functions.logger.error(
          "There are more than one classes registered with the given class info.",
          classInfos[index],
        );
      }

      const currentClassData = currentClassSnapshot
        ?.data() as ClassData;

      // Get a list of important changes
      const importantChanges = getImportantChanges(
        currentClassData,
        updatedClassData,
      );
      if (importantChanges !== null) {
        const classDataWithChanges = {
          ...currentClassData,
          department: updatedClassData.dept,
          course: updatedClassData.course,
          changes: importantChanges,
          wait_cap: updatedClassData.wait_cap,
        };
        // If there were important changes, add them to the complete list for all classes
        classesChanges.push(classDataWithChanges);
      }

      // Update class's firestore data with new data from OpenCourseAPI
      await currentClassSnapshot.ref.update({
        previous_data: {
          seats: updatedClassData.seats,
          waitlist_seats: updatedClassData.wait_seats,
          status: updatedClassData.status,
        },
      });
    }
  }

  return classesChanges;
}

/**
 * Get a list of all classes that each users is registered for.
 */
async function getAllClasses(): Promise<ClassInfo[]> {
  const registeredClassesRefs = await store.collection("users").select(
    "registered_classes",
  )
    .get();
  const registeredClassesPerUser = registeredClassesRefs.docs
    .map((docRef) => docRef.data()?.registered_classes)
    // Remove users without classes (should not happen but just in case)
    .filter((registeredClasses) => registeredClasses !== undefined);
  // Flatten all the registered_classes into one array with all classes
  const listOfClassesWithDuplicates = registeredClassesPerUser.flat();
  // Remove duplicate entries
  const listOfClasses = uniqWith<ClassInfo>(
    listOfClassesWithDuplicates,
    (a, b) =>
      // Start with CRN for early short circuit
      a.crn === b.crn &&
      a.term === b.term &&
      a.year === b.year &&
      a.campus === b.campus,
  );
  return listOfClasses;
}

interface ClassDataChanges {
  seats?: {
    previous: number;
    updated: number;
  };
  waitlist_seats?: {
    previous: number;
    updated: number;
  };
  status?: {
    previous: string;
    updated: string;
  };
}

/**
 * Get a list of the important changes since the previous update for the given class data.
 * @param classData The current class data in firestore database
 * @param updatedClassData The updated class data from OpenCourseAPI
 */
function getImportantChanges(
  classData: ClassData,
  updatedClassData: OpenCourseClassData,
): ClassDataChanges | null {
  const previousData = classData.previous_data;

  if (previousData === undefined) return null;

  const changes: ClassDataChanges = {};
  let hasImportantChange: boolean = false;

  // Seats is no longer 0
  if (
    previousData.seats !== updatedClassData.seats &&
    previousData.seats === 0 && updatedClassData.seats !== 0 &&
    updatedClassData.seats > 0
  ) {
    hasImportantChange = true;
    changes.seats = {
      previous: previousData.seats,
      updated: updatedClassData.seats,
    };
  }

  // Waitlist seats is no longer 0
  if (
    previousData.waitlist_seats !== updatedClassData.wait_seats &&
    previousData.waitlist_seats === 0 && updatedClassData.wait_seats !== 0 &&
    updatedClassData.wait_seats > 0
  ) {
    hasImportantChange = true;
    changes.waitlist_seats = {
      previous: previousData.waitlist_seats,
      updated: updatedClassData.wait_seats,
    };
  }

  // Status has changed and is not full anymore
  if (
    previousData.status !== updatedClassData.status.toLowerCase() &&
    updatedClassData.status.toLowerCase() !== "full"
  ) {
    hasImportantChange = true;
    changes.status = {
      previous: previousData.status,
      updated: updatedClassData.status,
    };
  }

  if (hasImportantChange === false) {
    return null;
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
  wait_cap: number;
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
 * Get the latest class data from OpenCourseAPI in a batch request.
 * @param campus The campus the class is in.
 * @param classes The classes to look for
 */
async function getUpdatedClassesData(
  campus: string,
  classes: ClassData[],
  year?: number,
  quarter?: "summer" | "fall" | "winter" | "spring",
) {
  const response = await got.post(
    `https://opencourse.dev/${campus}/classes` +
      (year !== undefined && quarter !== undefined
        ? `?year=${year}&quarter=${quarter}`
        : ""),
    {
      json: {
        resources: classes.map((classData) => ({ CRN: classData.crn })),
      },
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

  if (
    response.body === undefined ||
    Array.isArray((response.body as any)?.resources) === false
  ) {
    functions.logger.error(
      `Received invalid class data from OpenCourseAPI:`,
      response.body,
    );
    return null;
  }

  return (response.body as any).resources as ({
    status: "success";
    data: OpenCourseClassData;
  } | {
    status: "error";
    error: string;
  })[];
}
