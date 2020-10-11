# Cypress Email Authentication

Blog post: https://dev.to/pcreem/cypress-next-auth-mail-authentication-57f0

Code sample demonstrating how to test an email authentication workflow with Cypress.
Mails are sent to Mailtrap and exposed through its API.

##  Setting up
* `npx yarn`

* signup an [Mailtrap](https://mailtrap.io/) account and get SMTP server in demo inbox

* `code .env.local`
```
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_FROM=
NEXTAUTH_URL=
```

* `code cypress.env.json`
```
{
    "inboxUrl":"Your Mailtrap Inbox url with inboxId",
    "Api-Token":"Your Mailtrap API token"
}
```

## Running the tests

* `npx cypress open`
*  run sample_spec.js test

the result should like this
![cypress open](https://dev-to-uploads.s3.amazonaws.com/i/11y8jjbwgwhs8kcnj5yv.png)









