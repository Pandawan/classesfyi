export function strToBool(str: string, defaultValue: boolean = false): boolean {
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
