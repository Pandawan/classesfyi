import * as functions from "firebase-functions";
import * as sendgrid from "@sendgrid/mail";
import * as handlebars from "handlebars";
import { promises as fs } from "fs";

const apiKey = functions.config()?.sendgrid?.key;

sendgrid.setApiKey(apiKey);

interface EmailData {
  email: string;
  classesData: {
    [campusName: string]: {
      name: string;
      crn: number;
      changes: string[];
    }[];
  };
}

const rootDir = process.cwd();

// Cache the template so we don't have to compile it multiple times
let cachedTemplate: handlebars.TemplateDelegate | null = null;

async function formatEmail(data: EmailData): Promise<string> {
  if (cachedTemplate === null) {
    const templateStr = await fs.readFile(
      `${rootDir}/templates/email.inline.hbs`,
      "utf8",
    );
    cachedTemplate = handlebars.compile(templateStr);
  }

  return Promise.resolve(cachedTemplate(data));
}

export async function sendEmail(
  data: EmailData,
): Promise<{ type: "success" } | { type: "error"; error: string }> {
  const content = await formatEmail(data);

  if (apiKey === undefined) {
    return { type: "error", error: "SendGrid API key not found." };
  }

  const [response] = await sendgrid.send({
    from: { email: "help@classes.fyi" },
    to: { email: data.email },
    subject: "Classes.fyi: Updates about your classes",
    content: [{ type: "text/html", value: content }],
  });

  if (response.statusCode >= 200 && response.statusCode < 300) {
    return { type: "success" };
  } else {
    return {
      type: "error",
      error: typeof response.body === "string"
        ? response.body
        : JSON.stringify(response.body),
    };
  }
}
