# Classes.fyi

Get updates when your classes's seats open up.

## TODO

- Move update function to use batch request
- Store class terms in DB; make endpoints only require term & CRN; use additional class info from update when sending email
  - This reduces the amount of data I have to store and reduces the amount of parameters to look for in a DB query
- Refactor frontend
- Improve class schedule rendering
- Better frontend class searching
- Add loading messages to lookup views; make loading only show up [if taking longer than 1s](https://www.smashingmagazine.com/2016/12/best-practices-for-animated-progress-indicators/)
- Switch to Mailgun for sending emails
- Use [firebase email sign in](https://firebase.google.com/docs/auth/web/email-link-auth) with major overhaul
  - Requires changing a lot of code to support user authentication on frontend
  - Could flip things around and make the client send the class registration request directly to the database instead of using a function (this would limit the number of function calls made and probably be faster)

## Frontend

Frontend website is made using [Vue 3](https://github.com/vuejs/vue-next) and [Vite](https://github.com/vitejs/vite). It uses the [OpenCourseAPI](https://github.com/OpenCourseAPI/OpenCourseAPI) directly to get class data. It's hosted using Firebase Hosting as a SPA.

## Server

Backend server uses Firebase Functions in Node 12 and [TypeScript](https://www.typescriptlang.org/). Emails are rendered using [Handlebars](https://handlebarsjs.com).

### Functions

- POST `/getUserClasses`: Get user information (currently registered classes).
- POST `/registerClasses`: Register a specific email address to specific class updates.
- POST `/unregisterClasses`: Unregister a specific email address from specific class updates.
- POST `/unregisterAllClasses`: Unregister a specific email address from all updates (clearing it entirely from the database).

## Email Sending

### SendGrid

Emails are sent using the SendGrid.net API.

This email sending is done through these DNS settings on Cloudflare:

```dns
TXT  classes.fyi  v=spf1 include:spf.improvmx.com ~all  Auto  DNS only

MX  classes.fyi mx2.improvmx.com  20  Auto  DNS only

MX  classes.fyi  mx1.improvmx.com  10  Auto  DNS only
```

### Improvmx

Email forwarding is done with Improvmx.com.
This allows all emails sent to \*@classes.fyi to be redirected to my own address.
This also allows the sending of emails from my address as a @classes.fyi email address.

### Gmail

Email aliasing is done through Gmail.com.
An app-password was created and was used to connect improvmx to gmail through [a linking process](https://improvmx.com/guides/send-emails-using-gmail/).

## Credit

Made by [Miguel Tenant de La Tour](https://github.com/Pandawan).

Class data from [OpenCourseAPI](https://github.com/OpenCourseAPI/OpenCourseAPI).

## Contribute

If you have any ideas or things you want to improve on, you can submit a PR. Thanks!
