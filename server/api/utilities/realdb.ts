import { Database } from "./db.ts";
import { StoredFullData } from "../data.ts";

export const db = new Database<StoredFullData>(
  "data.json",
  { registration: {}, users: {} },
  { dryrun: false },
);
