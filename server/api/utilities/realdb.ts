import { config } from "https://deno.land/x/dotenv@v0.5.0/mod.ts";

import { Database } from "./db.ts";
import { StoredFullData } from "../data.ts";
import { strToBool } from "../../utilities/strToBool.ts";

const { DB_DRY_RUN } = config();

export const db = new Database<StoredFullData>(
  "data.json",
  { registration: {}, users: {} },
  { dryrun: strToBool(DB_DRY_RUN, false) }
);
