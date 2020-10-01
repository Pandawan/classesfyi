import {
  StoredFullData,
  ClassInfo,
  ClassData,
  UnformattedClassData,
  formatClassData,
  UpdatedClassData,
  StoredClassData,
  Campus,
  isValidCampus,
} from "./data.ts";
import { db } from "./utilities/realdb.ts";
import { groupBy } from "./utilities/groupBy.ts";

import { formatAndSendEmail } from "./utilities/email.ts";
/**
 * Get a list of all classes that have been registered to.
 * @returns {ClassInformation[]} Array of all classes
 */
function getRegisteredClasses(): ClassInfo[] {
  const registrations =
    db.get<StoredFullData["registration"]>(["registration"]) ?? {};

  /**
   * Traverse the object and look for all paths that end with the given key.
   * @param obj Object to search through.
   * @param key Key to look for in the object.
   */
  function getAllPathsToKey(
    obj: any,
    key: string,
    prev: string[] = [],
  ): string[][] {
    const result: string[][] = [];
    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        // If found the correct key, we're done searching for this path
        if (k == key) {
          result.push(prev);
        } // Keep searching through current object path
        else if (
          obj[k] !== undefined &&
          typeof obj[k] === "object" &&
          Array.isArray(obj[k]) === false
        ) {
          result.push(...getAllPathsToKey(obj[k], key, [...prev, k]));
        }
      }
    }
    return result;
  }

  const paths = getAllPathsToKey(registrations, "registered");

  return paths.map((path) => {
    if (!isValidCampus(path[0])) {
      throw new Error("Invalid campus saved");
    } else {
      return {
        campus: path[0],
        department: path[1],
        course: path[2],
        CRN: path[3],
      };
    }
  });
}

/**
 * Fetch the latest data about the given classes
 * @param classes List of classes to fetch class data for
 */
async function getClassDataBatch(
  classes: ClassInfo[],
): Promise<{
  [campusId: string]: [Error, null] | [null, { [crn: string]: ClassData }];
}> {
  // Get a list of all classes, grouped by campus
  const groupedClasses = groupBy(classes, (classInfo) => classInfo.campus);

  // List of CRNs to get data about, grouped by campus
  const wantedCRNs = Object.fromEntries(
    Object.entries(groupedClasses).map(([campusId, campusData]) => [
      campusId,
      campusData.map((classInfo) => classInfo.CRN),
    ]),
  );

  // Prepare data to be sent to the API, grouped by campus
  const perCampusWebData = Object.fromEntries(
    Object.entries(groupedClasses).map(([campusId, campusData]) => [
      campusId,
      campusData.map((classInfo) => ({
        course: classInfo.course,
        dept: classInfo.department,
      })),
    ]),
  );

  // Make the request for each campus and format the data
  const tasks = Object.entries(perCampusWebData).map(async function ([
    campusId,
    campusData,
  ]): Promise<
    | [string, Error, null]
    | [
      string,
      null,
      {
        [k: string]: ClassData;
      },
    ]
  > {
    // Make the request with all of the class data
    const res = await fetch(
      `https://opencourse.dev:3000/${campusId.toLowerCase()}/batch`,
      {
        method: "POST",
        body: JSON.stringify({
          courses: campusData,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // If the request went well, start working on the data
    if (res.ok) {
      const data: {
        courses: Array<{ [crn: string]: UnformattedClassData[] }>;
      } = await res.json();

      // Filter the data to only include the classes/CRNs that were requested
      const wantedData = data.courses.map((course) =>
        Object.fromEntries(
          Object.entries(course).filter(([crn]) =>
            wantedCRNs[campusId].includes(crn)
          ),
        )
      );
      // Flatten the array of objects into a single objects of { [crn: string]: UnformattedClassData[] }
      const formattedData = Object.fromEntries(
        Object.entries(
          wantedData.reduce((accum, depts) => {
            return {
              ...accum,
              ...depts,
            };
          }, {}),
        ).map(([crn, unformattedClassData]) => [
          crn,
          // Format the UnformattedClassData[] into ClassData
          formatClassData(unformattedClassData),
        ]),
      );
      return [campusId, null, formattedData];
    } else {
      // Parse the error message and return if there was one
      const errorMessage = (await res.text()).replace("Error! ", "");
      return [campusId, new Error(errorMessage), null];
    }
  });

  // Wait for all requests to finish
  const results = await Promise.all(tasks);
  // Gather all the task data back into one result, grouped by campus
  return results.reduce(
    (accumulator, [campusId, ...result]) => ({
      ...accumulator,
      [campusId]: result,
    }),
    {},
  );
}

/**
 * Update the status of all the classes, returning data about those that have noticeably changed.
 * @param classesData
 */
export function updateClassesStatus(
  classesData: Array<[ClassInfo, ClassData]>,
): UpdatedClassData[] {
  const importantUpdates: UpdatedClassData[] = [];

  // Loop through all class CRNs
  for (const [classInfo, classData] of classesData) {
    const path = [
      "registration",
      classInfo.campus,
      classInfo.department,
      classInfo.course,
      classInfo.CRN,
      "previous",
    ];
    // Navigate through the database to the corresponding CRN (with ClassInformation)
    const previousData = db.get<StoredClassData["previous"]>(path);
    // Check for changes
    if (
      // Make sure previous data exists
      previousData &&
      // If seats has changed
      (previousData["seats"] !== classData["seats"] ||
        // If wait seats has changed
        previousData["wait_seats"] !== classData["wait_seats"] ||
        previousData["status"] !== classData["status"])
    ) {
      // Was 0 seats, is no longer 0 seats
      const seatsChange = previousData["seats"] === 0 &&
        classData["seats"] !== 0;
      // Was 0 seats, was 0 waitlist, is not 0 waitlist
      const waitlistChange = previousData["seats"] === 0 &&
        previousData["wait_seats"] === 0 &&
        classData["wait_seats"] !== 0;
      // Changed status and is not Full right now
      const statusChange = previousData["status"] !== classData["status"] &&
        classData["status"] !== "Full";

      // Compare previous data to current using ClassData & save those that are important
      if (seatsChange || waitlistChange || statusChange) {
        const changeData = {
          ...classInfo, // TODO: Maybe add part of classData in addition?
          changes: ([
            [seatsChange, "seats"],
            [waitlistChange, "wait_seats"],
            [statusChange, "status"],
          ] as Array<[boolean, "seats" | "wait_seats" | "status"]>)
            .filter(([condition]) => condition)
            .map(([condition, name]) => ({
              type: name,
              previous: previousData[name],
              new: classData[name],
            })),
        };
        // TODO: Don't use `as`
        importantUpdates.push(changeData as UpdatedClassData);
      }
    }

    // Save current ClassData as previous data
    db.set(path, {
      wait_seats: classData["wait_seats"],
      seats: classData["seats"],
      status: classData["status"],
    });
  }
  // Return saved important info
  return importantUpdates;
}

/**
 * Add a "registered" field to the classesUpdates with the list of all emails registered.
 */
export function getRegisteredEmails(classesUpdates: UpdatedClassData[]) {
  return classesUpdates.map((classUpdate) => ({
    ...classUpdate,
    registered: db.get([
      "registration",
      classUpdate.campus,
      classUpdate.department,
      classUpdate.course,
      classUpdate.CRN,
      "registered",
    ]) as string[],
  }));
}

/**
 * Refresh registration data for the given classes;
 * then, gather a list of emails that need to be updated
 * and the classes they need to be updated about.
 * @param classes Classes to refresh data about.
 * @return A dictionary of emails and data-to-send
 */
async function refreshClasses(
  classes: ClassInfo[],
): Promise<[Record<string, UpdatedClassData[]>, Error[]]> {
  const emailsToSend: { [email: string]: UpdatedClassData[] } = {};

  // Ask for class info as a batch?
  const result = await getClassDataBatch(classes);

  const errors: Error[] = [];

  // Check if class info is different and relevant, get registered list and add to list of emails
  for (const campusId in result) {
    if (result.hasOwnProperty(campusId) && result[campusId] !== null) {
      const [errorForCampus, classDatas] = result[campusId];
      if (errorForCampus !== null) {
        errors.push(errorForCampus);
        break;
      } else if (classDatas !== null) {
        // Note: With indexes, might not need to pass in the class information as could be able to search simply through CRN
        const dataToUpdate: Array<[ClassInfo, ClassData]> = Object.entries(
          classDatas,
        ).map(
          ([crn, classData]) =>
            [classes.find((classInfo) => classInfo.CRN === crn), classData] as [
              ClassInfo,
              ClassData,
            ],
        );

        const updates = updateClassesStatus(dataToUpdate);

        const updatesWithEmail = getRegisteredEmails(updates);

        for (const { registered, ...update } of updatesWithEmail) {
          for (const email of registered) {
            if (!emailsToSend[email]) emailsToSend[email] = [];
            emailsToSend[email].push(update);
          }
        }
      }
    }
  }

  return [emailsToSend, errors];
}

export async function refresh() {
  // Get classes that need to be updated
  const classesToUpdate = getRegisteredClasses();

  // Refresh them
  const [updatedClassDataByEmail, campusErrors] = await refreshClasses(
    classesToUpdate,
  );

  if (campusErrors.length !== 0) {
    console.error("Error refreshing classes", campusErrors);
  }

  // Attempt to send this data by email
  const emailSendingAttempts = await formatAndSendEmail(
    updatedClassDataByEmail,
  );

  return {
    emails: emailSendingAttempts,
    campus_errors: campusErrors,
  };
}
