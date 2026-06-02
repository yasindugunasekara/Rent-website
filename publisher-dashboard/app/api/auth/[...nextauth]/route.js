import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch("http://localhost:5079/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (res.ok && data.user) {
            return {
              id: data.user.id,
              name: data.user.firstName + " " + data.user.lastName,
              email: data.user.email,
              role: data.user.role,
              accessToken: data.token,
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        if (account.provider === "google") {
          try {
            const res = await fetch("http://localhost:5079/api/auth/google-login", {
              method: "POST",
              body: JSON.stringify({
                idToken: account.id_token,
              }),
              headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
              const data = await res.json();
              token.id = data.user.id;
              token.role = data.user.role;
              token.name = data.user.firstName + " " + data.user.lastName;
              token.email = data.user.email;
              token.accessToken = data.token;
            } else {
              const errorText = await res.text();
              console.error("Backend Google login failed:", errorText);
            }
          } catch (error) {
            console.error("Google backend auth error:", error);
          }
        } else if (user) {
          token.id = user.id;
          token.role = user.role;
          token.name = user.name;
          token.email = user.email;
          token.accessToken = user.accessToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7200, // 2 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
