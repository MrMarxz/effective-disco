/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "~/lib/prisma";
import { env } from "~/env";
import { db } from "~/server/db";
import { validatePasswordWithSalt } from "~/lib/utils";
import { RoleEnum } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roleName: RoleEnum
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: ({ token, user }) => {
      // console.log('JWT CALLBACK', token, user);
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: ({ session, token }) => {
      // console.log('SESSION CALLBACK', session, token);
      session.user = token.user as {
        id: string;
        roleName: RoleEnum;
      };
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        // const hashed_response: PasswordHashResponse = hashPassword(password);

        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            salt: true,
            role: {
              select: {
                name: true
              }
            },
          }
        });

        if (!user) {
          return null;
        }

        // Hash the input password with the salt from the database
        const isValid = validatePasswordWithSalt(
          password,
          user.salt,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          user.password,
        );

        if (isValid) {
          const filteredUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            roleName: user.role.name
          }
          return filteredUser;
        } else {
          return null;
        }
      },
    }),
  ],
  session: {
    maxAge: 1 * 24 * 60 * 60,
  },
  // If the user goes to a protected page but is not signed in, redirect to this page
  pages: {
    signIn: "/login",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
