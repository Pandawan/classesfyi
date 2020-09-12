import { sendSimpleMail } from "https://deno.land/x/sendgrid@0.0.3/mod.ts";
import { config } from "https://deno.land/x/dotenv@v0.5.0/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.8.0/mod.ts";

import { Campus, UpdatedClassData } from "../data.ts";
import { groupBy } from "./groupBy.ts";

const { SENDGRID_API_KEY } = config();

type EmailData = Record<
  Campus,
  {
    changes: string[];
    campus: Campus;
    department: string;
    course: string;
    CRN: string;
  }[]
>;

export async function formatAndSendEmail(data: {
  [email: string]: UpdatedClassData[];
}): Promise<
  Array<
    | { type: "emailed"; email: string }
    | { type: "error"; email: string; error: string }
  >
> {
  const emailPerCampusData: Array<[string, EmailData]> = Object.entries(
    data
  ).map(([email, classesData]) => {
    const formattedClassData = classesData.map((classData) => ({
      ...classData,
      changes: classData.changes
        .map((change) => {
          if (change.type === "seats") {
            if (change.new === 1) {
              return `There is 1 seat available (was ${change.previous})`;
            } else {
              return `There are ${change.new} seats available (was ${change.previous})`;
            }
          } else if (change.type === "status") {
            return `Class status is now ${change.new} (was ${change.previous}).`;
          } else if (change.type === "wait_seats") {
            if (change.new === 1) {
              return `There is 1 waitlist seat available (was ${change.previous})`;
            } else {
              return `There are ${change.new} waitlist seats available (was ${change.previous})`;
            }
          }
        })
        .filter((formattedChange) => formattedChange !== undefined) as string[],
    }));

    return [
      email,
      groupBy(formattedClassData, (classInfo) => classInfo.campus),
    ];
  });

  const tasks = emailPerCampusData.map(async ([email, emailData]) => {
    try {
      const emailContent = await renderEmail(email, emailData);
      await sendEmail(email, emailContent);
      return email;
    } catch (error) {
      error.email = email;
      throw error;
    }
  });

  return (await Promise.allSettled(tasks)).map((result) => {
    if (result.status === "rejected") {
      return {
        type: "error",
        error: (result.reason as Error).message,
        email: result.reason.email as string,
      };
    } else {
      return {
        type: "emailed",
        email: result.value,
      };
    }
  });
}

async function renderEmail(email: string, emailData: EmailData) {
  return await renderFileToString(
    `${Deno.cwd()}/server/templates/email.inline.ejs`,
    {
      it: {
        email,
        data: emailData,
        campusNames: {
          FH: "Foothill",
          DA: "De Anza",
        } as Record<Campus, string>,
      },
    }
  );
}

async function sendEmail(email: string, emailContent: string) {
  const result = await sendSimpleMail(
    {
      subject: "Classes.fyi: Updates about your classes",
      to: [{ email }],
      from: { email: "help@classes.fyi" },
      content: [{ type: "text/html", value: emailContent }],
    },
    {
      apiKey: SENDGRID_API_KEY,
    }
  );

  if (result.success === false && result.errors !== undefined) {
    throw new Error(
      `Could not send email to ${email}: ${result.errors.join(", ")}`
    );
  }
}
