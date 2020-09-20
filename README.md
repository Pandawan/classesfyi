# Classes.fyi

Get updates when your classes's seats open up.

## TODO

- Cleanup CSS
- Favicon
- Add a back button
- Fix issues in Google Lighthouse results
- Allow for refresh rate option in .env
- Better searching? (fuzzy)
- Move server to new OpenCourseAPI?

## Website

Frontend website is made using [Vue 3](https://github.com/vuejs/vue-next) and [Vite](https://github.com/vitejs/vite). It uses the [OpenCourseAPI](https://github.com/OpenCourseAPI/OpenCourseAPI) directly to get class data.

## Server

Backend server is made in [Deno](https://github.com/denoland/deno). It uses the old [OwlAPI](https://github.com/OpenCourseAPI/OwlAPI) (rather than OpenCourseAPI) because of its batch request feature.

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

Made by Miguel Tenant de La Tour (Pandawan).

Class data from [OpenCourseAPI](https://github.com/OpenCourseAPI/OpenCourseAPI).

## Contribute

If you have any ideas or things you want to improve on, you can submit a PR. Thanks!
