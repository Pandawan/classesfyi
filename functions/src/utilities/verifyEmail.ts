type Result<T> = {
  type: "ok";
  value: T;
} | {
  type: "error";
  message: string;
};

/**
 * Checks if the given element is an email address, giving an error message if not.
 * @param e
 */
export function verifyEmail(e: any): Result<string> {
  if (e === undefined) {
    return { type: "error", message: "Email field is required." };
  } else if (typeof e !== "string") {
    return { type: "error", message: "Email must be a string." };
  }
  return { type: "ok", value: e };
}
