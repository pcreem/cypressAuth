### There will be two steps to build up:
1. assemble mail authentication components  
2. build action flow test


### 1. assemble mail authentication components 
We will use the following unit to build mail authentication, mainly use [next-auth](https://next-auth.js.org/getting-started/example) example
* authentication method: next-auth
* SMTP server: [mailtrap](https://mailtrap.io/)
* a databse: sqlite3
* a mail sender: nodemailer


#### Setting up
* `npx create-next-app my-app` (you could have install problems as mentioned on nextjs)
* `npx yarn add next-auth sqlite3 nodemailer`
* `code .\pages\api\auth\sendmail.js`
```
import nodemailer from 'nodemailer'

const sendVerificationRequest = ({ identifier: email, url, token, baseUrl, provider }) => {
  return new Promise((resolve, reject) => {
    const { server, from } = provider
    // Strip protocol from URL and use domain as site name
    const site = baseUrl.replace(/^https?:\/\//, '')

    nodemailer
      .createTransport(server)
      .sendMail({
        to: email,
        from,
        subject: `Sign in to ${site}`,
        text: text({ url, site, email }),
        html: html({ url, site, email })
      }, (error) => {
        if (error) {
          logger.error('SEND_VERIFICATION_EMAIL_ERROR', email, error)
          return reject(new Error('SEND_VERIFICATION_EMAIL_ERROR', error))
        }
        return resolve()
      })
  })
}

// Email HTML body
const html = ({ url, site, email }) => {
  // Insert invisible space into domains and email address to prevent both the
  // email address and the domain from being turned into a hyperlink by email
  // clients like Outlook and Apple mail, as this is confusing because it seems
  // like they are supposed to click on their email address to sign in.
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`
  const escapedSite = `${site.replace(/\./g, '&#8203;.')}`

  // Some simple styling options
  const backgroundColor = '#f9f9f9'
  const textColor = '#444444'
  const mainBackgroundColor = '#ffffff'
  const buttonBackgroundColor = '#346df1'
  const buttonBorderColor = '#346df1'
  const buttonTextColor = '#ffffff'

  // Uses tables for layout and inline CSS due to email client limitations
  return `
<body style="background: ${backgroundColor};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        <strong>${escapedSite}</strong>
      </td>
    </tr>
  </table>
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        Sign in as <strong>${escapedEmail}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Sign in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`
}

// Email text body – fallback for email clients that don't render HTML
const text = ({ url, site }) => `Sign in to ${site}\n${url}\n\n`

export default sendVerificationRequest;

```
* `code .\pages\api\auth\[...nextauth].js`
```
import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import Adapters from "next-auth/adapters"
import sendVerificationRequest from "./sendmail"

const options = {
    providers: [
        Providers.Email({
          server: {
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT,
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD
            }
          },
          from: process.env.EMAIL_FROM,
          sendVerificationRequest
        }),
      ],

  adapter: Adapters.TypeORM.Adapter(
    {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true
    }
  ),
}

export default (req, res) => NextAuth(req, res, options)
```
* `code .\pages\index.js`
```
import React from 'react'
import { signIn, signOut, useSession } from 'next-auth/client'

export default function Page() {
  const [ session, loading ] = useSession()

  return <>
    {!session && 
    <>
      Not signed in <br/>
      <button onClick={signIn}>Sign in</button>
    </>
    }
    {session && <>
      Signed in as {session.user.email} <br/>
      <button onClick={signOut}>Sign out</button>
    </>}
  </>
}
```
* `code .\pages\_app.js`
```
import { Provider } from 'next-auth/client'

export default function App ({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  )
}
```
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
* `npx next dev`

#### email login test, you will see 
* a notification on the webpage  
![homepage](https://dev-to-uploads.s3.amazonaws.com/i/a1cfuqzhu9lfh29457i6.png)
* an email notification in Mailtrap inbox
![Mailtrap inbox](https://dev-to-uploads.s3.amazonaws.com/i/001gq79lvzqnfjgvlppw.png)
* webpage turn to login state with httpOnly cookie
![login](https://dev-to-uploads.s3.amazonaws.com/i/belpwqjeu2rq19g9mwhx.png)

### 2. build action flow test

#### Aim to solve the following test:
* send an email after a user signup
* check the email has been received
* make sure the email contains the link to the homepage
* click the link in email redirect to the homepage 
* make sure the page turn to login state
* keep user login after page refresh 

#### Setting up

* `npx yarn add cypress`
* _optional_ `npx yarn add faker`
* `code .\cypress\integration\sample_spec.js`
```
const faker = require('faker');
const randomEmail = faker.internet.email().toLowerCase();

describe('Login Test', () => {

    it('Visits the test page', () => {
      cy.visit('http://localhost:3000')
      cy.contains('Sign in').click()
      cy.url().should('include', '/api/auth/signin')

      cy.get('#input-email-for-email-provider')
        .type(randomEmail)
        .should('have.value', randomEmail)
    
        cy.contains('Sign in with Email').click()
        cy.contains('Check your email')
        
    });

    it('should send an email containing a verification link', () => {
        const inboxUrl = Cypress.env('inboxUrl')
        const token  = Cypress.env('Api-Token')

        cy.getLastEmail().then(html => {
     
          const link = html.match(/href="([^"]*)/)[1]
          cy.expect(link).to.contains('/api/auth/callback/email')
          cy.visit(link);
          cy.contains(`Signed in as ${randomEmail}`)
          cy.reload()
          cy.contains(`Signed in as ${randomEmail}`)
          //delete all mail
          cy.request({
            method: 'PATCH',
            url: `${inboxUrl}/clean`,
            headers: {
                'Api-Token': token,
                }
            });
        });
      });
  })


```

* `code .\cypress\support\commands.js`
```
const inboxUrl = Cypress.env('inboxUrl')
const token  = Cypress.env('Api-Token')

Cypress.Commands.add('getLastEmail', () => {
    function requestEmail() {
      return cy
        .request({
          method: 'GET',
          url: `${inboxUrl}/messages`,
          headers: {
            'Api-Token': token,
          },
          json: true,
        })
        .then(({ body }) => {
   
          if (body) {
            
            let msgId = body[0].id
            cy.request({
            method: 'GET',
            url: `${inboxUrl}/messages/${msgId}/body.html`,
            headers: {
                'Api-Token': token,
            },
            json: true,
            }).then(({ body }) => { 
                if (body) { return body }
                 
                cy.wait(1000);  
                return requestEmail();
            })
          }
        });
    }
  
    return requestEmail();
  });

```
* configuration `code cypress.json`
_there could have network problems during the test, use "retries" to retry the test will save your time, visit cypress page for [more info](https://docs.cypress.io/guides/guides/test-retries.html#Introduction)_
```
{
    "retries": 3 
}
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

[repo](https://github.com/pcreem/cypressAuth)






