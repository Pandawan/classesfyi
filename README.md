# Classes.fyi

Get updates when your classes's seats open up.

## TODO

- Clean up `functions/update.ts`
- Add a self-cleanup function that runs once a month to check the current quarter & unregister all user from previous quarters
- Improve class schedule rendering
- Better frontend class searching
- Add loading messages to lookup views; make loading only show up [if taking longer than 1s](https://www.smashingmagazine.com/2016/12/best-practices-for-animated-progress-indicators/)
- Add desktop browser notification support?

## Frontend

Frontend website is made using [Vue 3](https://github.com/vuejs/vue-next) and [Vite](https://github.com/vitejs/vite). It uses the [OpenCourseAPI](https://github.com/OpenCourseAPI/OpenCourseAPI) directly to get class data. It's hosted using Firebase Hosting as a SPA.

## Server

Backend server uses Firebase Functions in Node 12 and [TypeScript](https://www.typescriptlang.org/). Emails are rendered using [Handlebars](https://handlebarsjs.com).

### Functions

- `cleanupUnusedClasses`: Runs automatically when a user unregisters from a class; checks if that class is registered by any other user, and deletes it if not.
- `updateClassesData`: Runs periodically through a pubsub; gets updated class data from OpenCourse, checks if any class status has changed significantly, and sends an email to each person registered to those classes.

## Email

### Sending

Emails are rendered using Handlebars with two different templates (one for html and one for plain text). They are sent through [Mailgun](https://www.mailgun.com/).

### Receiving

Email receiving & followup is done with a [Zoho mail](https://www.zoho.com/mail/) free account.

## Credit

Made by [Miguel Tenant de La Tour](https://github.com/Pandawan) with the help of [Madhav Varshney](https://github.com/madhavarshney).

Class data provided by [OpenCourseAPI](https://github.com/OpenCourseAPI/OpenCourseAPI).

## Contribute

If you have any ideas or things you want to improve on, you can submit a PR. Thanks!

### Basic Setup

_Prerequisites_: You must have Nodejs (preferably v12), and the `firebase-tools` package globally installed.

```sh
# Note: You might need to npm install in order for some steps to work

# To test the website only (no user accounts/registration)
cd hosting
npm run dev

# If you want the full setup, run the above and in a separate terminal run this at the root of the project
firebase emulators:start

# In both cases, the website will be available at http://localhost:8000
```
