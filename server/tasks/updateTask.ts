import { refresh } from "../api/lib.ts";

// 15 * 60 x 10^3 ms = 15 minutes
const intervalDuration = 15 * 60e3;

// Launch a recurring task to refresh the API
export const updateTask = () => {
  const task = setInterval(async () => {
    try {
      console.log(
        `Refreshing class status (every ${intervalDuration / 60e3} mins)`
      );
      // Send refresh request
      const { emails, campus_errors } = await refresh();

      // Report errors
      if (campus_errors && campus_errors.length !== 0) {
        for (const campusError of campus_errors) {
          console.error(campusError);
        }
      }

      // Report email results
      const successEmails = [];
      for (const emailResult of emails) {
        if (emailResult.type === "emailed") {
          successEmails.push(emailResult.email);
        } else if (emailResult.type === "error") {
          console.error(
            `Email error (${emailResult.email}): ${emailResult.error}`
          );
        }
      }
      if (successEmails.length !== 0) {
        console.log(`Successfully sent emails to`, successEmails.join(", "));
      }
    } catch (error) {
      console.error(error);
    }
  }, intervalDuration);

  return () => clearInterval(task);
};
