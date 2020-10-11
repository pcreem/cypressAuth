#### Setting up
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
* `npx cypress open`
*  run sample_spec.js test

the result should like this
![cypress open](https://dev-to-uploads.s3.amazonaws.com/i/11y8jjbwgwhs8kcnj5yv.png)

or to CI locally
* `npx yarn add start-server-and-test`
* `npx start-server-and-test 'next dev' 3000 'cypress run'`
![cypress run](https://dev-to-uploads.s3.amazonaws.com/i/es2y7570m8qbfxt7mteg.png)







