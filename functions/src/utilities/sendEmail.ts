import * as functions from "firebase-functions";
import * as MailGun from "mailgun-js";
import * as handlebars from "handlebars";
import { promises as fs } from "fs";

const apiKey = functions.config()?.mailgun?.key;
const mailgun = MailGun({ apiKey, domain: "classes.fyi" });

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
let cachedHtmlTemplate: handlebars.TemplateDelegate | null = null;
let cachedTextTemplate: handlebars.TemplateDelegate | null = null;

async function formatHtmlEmail(data: EmailData): Promise<string> {
  if (cachedHtmlTemplate === null) {
    const templateStr = await fs.readFile(
      `${rootDir}/templates/email.inline.hbs`,
      "utf8",
    );
    cachedHtmlTemplate = handlebars.compile(templateStr);
  }

  return Promise.resolve(cachedHtmlTemplate(data));
}

async function formatTextEmail(data: EmailData): Promise<string> {
  if (cachedTextTemplate === null) {
    const templateStr = await fs.readFile(
      `${rootDir}/templates/email.text.hbs`,
      "utf8",
    );
    cachedTextTemplate = handlebars.compile(templateStr);
  }

  return Promise.resolve(cachedTextTemplate(data));
}

export async function sendEmail(
  data: EmailData,
): Promise<{ type: "success" } | { type: "error"; error: string }> {
  const htmlContent = await formatHtmlEmail(data);
  const textContent = await formatTextEmail(data);

  if (apiKey === undefined) {
    return { type: "error", error: "SendGrid API key not found." };
  }

  try {
    await mailgun.messages().send({
      from: "Classes.fyi <help@classes.fyi>",
      to: [data.email],
      subject: "Classes.fyi: Updates about your classes",
      text: textContent,
      html: htmlContent,
    });
    return {
      type: "success",
    };
  } catch (err) {
    return {
      type: "error",
      error: err,
    };
  }
}
