# Classes.fyi
## Email Sending

### SendGrid

Emails are sent using the SendGrid.net API.

This email sending is done through these DNS settings on Cloudflare:

```
TXT  classes.fyi  v=spf1 include:spf.improvmx.com ~all  Auto  DNS only

MX  classes.fyi mx2.improvmx.com  20  Auto  DNS only

MX  classes.fyi  mx1.improvmx.com  10  Auto  DNS only
```

### Improvmx

Email forwarding is done with Improvmx.com.
This allows all emails sent to \*@classes.fyi to be redirected to migueltenant@gmail.com.
This also allows the sending of emails from migueltenant@gmail.com as a @classes.fyi email address.

### Gmail

Email aliasing is done through Gmail.com.
An app-password was created and was used to connect improvmx to gmail through [a linking process](https://improvmx.com/guides/send-emails-using-gmail/).
