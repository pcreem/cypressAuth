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