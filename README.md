# Classes.fyi

Get updates when your classes's seats open up.

## TODO

- Improve class schedule rendering
- Better frontend class searching
- Add loading messages to lookup views; make loading only show up [if taking longer than 1s](https://www.smashingmagazine.com/2016/12/best-practices-for-animated-progress-indicators/)
- Add desktop browser notification support?

## Frontend

Frontend website is made using [Vue 3](https://github.com/vuejs/vue-next) and [Vite](https://github.com/vitejs/vite). It uses the [OpenCourseAPI](https://github.com/OpenCourseAPI/OpenCourseAPI) directly to get class data. It's hosted using Firebase Hosting as a SPA.

## Server

Backend server uses Firebase Functions in Node 12 and [TypeScript](https://www.typescriptlang.org/). Emails are rendered using [Handlebars](https://handlebarsjs.com).

### Functions

- POST `/getUserClasses`: Get user information (currently registered classes).
- POST `/registerClasses`: Register a specific email address to specific class updates.
- POST `/unregisterClasses`: Unregister a specific email address from specific class updates.
- POST `/unregisterAllClasses`: Unregister a specific email address from all updates (clearing it entirely from the database).

## Email

## Sending

Emails are rendered using Handlebars with two different templates (one for html and one for plain text). They are sent through [Mailgun](https://www.mailgun.com/).

## Receiving

Email receiving & followup is done with a [Zoho mail](https://www.zoho.com/mail/) free account.

## Credit

Made by [Miguel Tenant de La Tour](https://github.com/Pandawan).

Class data from [OpenCourseAPI](https://github.com/OpenCourseAPI/OpenCourseAPI).

## Contribute

If you have any ideas or things you want to improve on, you can submit a PR. Thanks!
