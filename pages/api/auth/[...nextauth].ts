import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

import { dbUsers } from '../../../database';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    // ...add more providers here

    // Credentials({
    //   name: "Custom Login",
    //   credentials: {
    //     email: {
    //       label: "Correo:",
    //       type: "email",
    //       placeholder: "correo@google.com",
    //     },
    //     password: {
    //       label: "Contraseña:",
    //       type: "password",
    //       placeholder: "Contraseña",
    //     },
    //   },
    //   async authorize(credentials): Promise<any> {
    //     // console.log({credentials})
    //     // return { name: 'Juan', correo: 'juan@google.com', role: 'admin' };

    //     // Replace the following line with your own logic to check the user's email and password
    //     const user = await dbUsers.checkUserEmailPassword(
    //       credentials!.email,
    //       credentials!.password
    //     );

    //     if (user) {
    //       // If the user is found, return the user object
    //       return user;
    //     } else {
    //       // If the user is not found, return null
    //       return null;
    //     }
    //   },
    // }),

    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  // Custom Pages
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register'
  },

  // Callbacks
  jwt: {
    // secret: process.env.JWT_SECRET_SEED, // deprecated
  },
  
  session: {
    maxAge: 2592000, /// 30d
    strategy: 'jwt',
    updateAge: 86400, // cada día
  },


  callbacks: {

    async jwt({ token, account, user }) {
      //  console.log({ token, account, user });

      if ( account ) {
        token.accessToken = account.access_token;

        switch( account.type ) {

          case 'oauth': 
            token.user = await dbUsers.oAUthToDbUser( user?.email || '', user?.name || '' );
          break;

          case 'credentials':
            token.user = user;
          break;
        }

      }

      return token;
    },


    async session({ session, token, user }){
    //  console.log({ session, token, user });

      (session as any).accessToken = token.accessToken;
      session.user = token.user as any;

      return session;
    }
    

  }

});