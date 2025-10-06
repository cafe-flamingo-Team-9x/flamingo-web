import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // Configure Prisma as the database adapter
  adapter: PrismaAdapter(prisma),

  // Configure authentication providers
  providers: [
    // Use validated env values
    GoogleProvider({
      clientId: getServerEnv().GOOGLE_CLIENT_ID,
      clientSecret: getServerEnv().GOOGLE_CLIENT_SECRET,
    }),
  ],

  // Secret for signing session cookies
  secret: getServerEnv().NEXTAUTH_SECRET,

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages for sign-in
  pages: {
    signIn: "/admin/login",
  },

  // Callbacks for extending NextAuth.js functionality
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      const adminRecord = await prisma.admin.findUnique({
        where: { email: user.email },
      });

      if (!adminRecord) {
        console.warn(`Blocked non-admin login attempt for ${user.email}.`);
        const params = new URLSearchParams({
          error: "not_admin",
          error_description:
            "The Google account you used is not authorized for the Cafe Flamingo admin dashboard.",
        });
        return `/admin/login?${params.toString()}`;
      }

      if (user.id) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: {
              isAdmin: true,
              name: adminRecord.name ?? user.name ?? undefined,
            },
          })
          .catch((error) => {
            console.warn("Failed to sync admin flag on user record.", error);
          });
      }

      return true;
    },
    async session({ session, token }) {
      // This callback is called whenever a session is checked.
      // We want to add the user's ID and isAdmin status to the session.
      if (session.user) {
        if (token?.id) {
          session.user.id = token.id;
        }
        session.user.isAdmin = Boolean(token?.isAdmin);
        if (token && "picture" in token && token.picture) {
          session.user.image = token.picture as string;
        } else if (token && "image" in token && token.image) {
          session.user.image = token.image as string;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // This callback is called whenever a JWT is created or updated.
      // We need to add the user's ID and isAdmin status to the JWT.
      if (user) {
        token.id = user.id;
        if (user.email) {
          token.email = user.email;
        }
        if (user.image) {
          token.picture = user.image;
          token.image = user.image;
        }
      }

      const emailFromToken = typeof token.email === "string" ? token.email : undefined;

      if (emailFromToken) {
        const adminRecord = await prisma.admin.findUnique({
          where: { email: emailFromToken },
        });

        const isAdmin = Boolean(adminRecord);
        token.isAdmin = isAdmin;

        if (user?.id) {
          await prisma.user
            .update({
              where: { id: user.id },
              data: {
                isAdmin,
                name: adminRecord?.name ?? user.name ?? undefined,
              },
            })
            .catch((error) => {
              console.warn("Failed to update user admin flag during JWT callback.", error);
            });
        }
      } else if (token.isAdmin === undefined) {
        token.isAdmin = false;
      }

      return token;
    },
  },

  // Debug mode for development
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
