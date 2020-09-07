import mergeWith from "https://cdn.skypack.dev/lodash-es@^4.17.15/mergeWith.js";
import {
  existsSync,
} from "https://deno.land/std@0.68.0/fs/exists.ts";
import {
  writeJsonSync,
} from "https://deno.land/std@0.68.0/fs/write_json.ts";
import {
  readJsonSync,
} from "https://deno.land/std@0.68.0/fs/read_json.ts";

export class Database<T extends {}> {
  private file: string;
  private data: T;
  private storeDebounce: number | null;
  private dryrun: boolean;

  constructor(
    file: string,
    defaultValue: T,
    options: { dryrun: boolean } = { dryrun: true },
  ) {
    this.file = file;
    this.storeDebounce = null;
    this.dryrun = options.dryrun;

    if (existsSync(this.file) === false) {
      this.data = defaultValue;
    } else {
      try {
        let currentData: any = readJsonSync(this.file);

        for (const key in defaultValue) {
          if (
            defaultValue.hasOwnProperty(key) &&
            currentData.hasOwnProperty(key) === false
          ) {
            const element = defaultValue[key];
            currentData[key] = element;
          }
        }

        this.data = currentData;
      } catch (error) {
        error.message = `Could not open database file ${error.message}`;
        error.name = "DatabaseError";
        throw error;
      }
    }
    this.store(false);
  }

  /**
   * Store the current data to the file.
   * @param debounce Whether or not to debounce this action if it is called within 15 seconds.
   */
  private store(debounce = true) {
    if (this.dryrun === true) return;

    if (this.storeDebounce !== null) {
      clearTimeout(this.storeDebounce);
      this.storeDebounce = null;
    }

    this.storeDebounce = setTimeout(() => {
      writeJsonSync(this.file, this.data, { spaces: 2 });
    }, debounce ? /* 3e3 */ 0 : 0);
  }

  public get<U>(path: string | string[], setFields = false): U | undefined {
    const newPath = Array.isArray(path) ? path : path.split(".");

    let value = newPath.reduce((p, c) => {
      if (p && !p[c] && setFields) p[c] = {};
      return (p && p[c]) ?? null;
    }, this.data as any);
    return value;
  }

  public set(path: string | string[], value: any) {
    const newPath = Array.isArray(path) ? path : path.split(".");
    let final = newPath.pop();

    if (final === undefined) {
      throw new Error("Invalid path");
    }

    let field = this.get<any>(newPath, true);
    field[final] = value;
    this.store();
  }

  public read(): T {
    return this.data;
  }

  public write(dataToWrite: DeepPartial<T>, mode: "merge" | "overwrite"): void {
    if (mode === "merge") {
      mergeWith(this.data, dataToWrite, customizer);
    } else if (mode === "overwrite") {
      this.data = { ...this.data, ...dataToWrite };
    }
    this.store();
  }
}

/**
 * Customizer function used by lodash mergeWith to concatenate arrays when merging.
 */
function customizer(objValue: any, srcValue: any) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};
