import { config } from "https://deno.land/x/dotenv@v0.5.0/mod.ts";

import { Database } from "./db.ts";
import { StoredFullData } from "../data.ts";

const { DB_DRY_RUN } = config();

export const db = new Database<StoredFullData>(
  "data.json",
  { registration: {}, users: {} },
  { dryrun: strToBool(DB_DRY_RUN, false) },
);

function strToBool(str: string, defaultValue: boolean = false): boolean {
  switch (str?.toLowerCase()) {
    case "true":
    case "t":
    case "1":
    case "yes":
    case "y":
      return true;

    case "false":
    case "f":
    case "0":
    case "no":
    case "n":
      return false;
    default:
      return defaultValue;
  }
}
