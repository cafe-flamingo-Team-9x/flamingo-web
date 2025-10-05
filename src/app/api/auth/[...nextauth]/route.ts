import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  // Configure Prisma as the database adapter
  adapter: PrismaAdapter(prisma),

  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID ??
        (() => {
          throw new Error('GOOGLE_CLIENT_ID is not set');
        })(),
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ??
        (() => {
          throw new Error('GOOGLE_CLIENT_SECRET is not set');
        })(),
    }),
  ],

  // Secret for signing session cookies
  secret: process.env.NEXTAUTH_SECRET,

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages for sign-in, sign-out, errors etc.
  pages: {
    signIn: '/admin/login',
    // signOut: '/auth/signout',
    // error: '/auth/error',
  },

  // Callbacks for extending NextAuth.js functionality
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // This callback is called whenever a user attempts to sign in.
      // We can use it to check if the user is an admin.

      // First, check if the user exists in our database and if they are an admin.
      if (!user.email) {
        return false;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        // Allow new users to sign in. They will inherit the Prisma default for isAdmin.
        return true;
      }

      if (existingUser.isAdmin) {
        return true; // Allow the user to sign in
      }

      console.warn(`Blocked non-admin login attempt for ${user.email}.`);
      return false; // Prevent sign-in for non-admin users
    },
    async session({ session, user, token }) {
      // This callback is called whenever a session is checked.
      // We want to add the user's ID and isAdmin status to the session.
      if (session.user) {
        if (token?.id) {
          session.user.id = token.id;
        }
        if (token?.isAdmin !== undefined) {
          session.user.isAdmin = token.isAdmin;
        }
        if (token && 'picture' in token && token.picture) {
          session.user.image = token.picture as string;
        } else if (token && 'image' in token && token.image) {
          session.user.image = token.image as string;
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // This callback is called whenever a JWT is created or updated.
      // We need to add the user's ID and isAdmin status to the JWT.
      if (user) {
        token.id = user.id;
        if (user.image) {
          token.picture = user.image;
          token.image = user.image;
        }
        // Retrieve isAdmin status from the database.
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true, image: true },
        });
        token.isAdmin = dbUser?.isAdmin || false;
        if (!token.picture && dbUser?.image) {
          token.picture = dbUser.image;
        }
      }
      return token;
    },
  },

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
