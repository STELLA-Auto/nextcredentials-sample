import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import {jwtDecode} from "jwt-decode";

if (
    !process.env.AUTH0_CLIENT_ID ||
    !process.env.AUTH0_CLIENT_SECRET ||
    !process.env.AUTH0_DOMAIN ||
    !process.env.NEXTAUTH_SECRET ||
    !process.env.AUTH0_CONNECTION
) {
  throw new Error("One or more required environment variables are not set");
}

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: 'auth0-credentials', // Unique ID for the second provider
      name: 'Auth0 via Custom Login',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        // Forward username and password to Auth0
        const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'password', // Required for Resource Owner Password Grant
            username: credentials?.email, // Map email to username
            password: credentials?.password, // Pass the password
            audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`, // Typically the API identifier
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            connection: process.env.AUTH0_CONNECTION, // Specify the connection name
          }),
        });

        if (!res.ok) {
          console.error('Auth0 authentication failed', await res.json());
          throw new Error('Invalid username or password');
        }

        const data = await res.json() as { id: string; access_token: string };

        console.log('Fetched data:', data);

        return {
          id: data.id || jwtDecode<{ sub: string }>(data.access_token).sub,
          email: credentials?.email,
          accessToken: data.access_token,
        };
      },
    })
  ],
  callbacks: {
    // these code sample to manage session and jwts
    // async session({ session, token }) {
    //   session.user = {
    //     email: token.email,
    //   };
    //   session.accessToken = token.accessToken;
    //   return session;
    // },
    // async jwt({ token, user }) {
    //   if (user?.accessToken) {
    //     try {
    //       const decodedToken = jwtDecode<{ sub: string }>(user.accessToken);
    //       token.id = decodedToken.sub;
    //       token.accessToken = user.accessToken;
    //       token.email = user.email;
    //     } catch (err) {
    //       console.error("Failed to decode JWT:", err);
    //     }
    //   }
    //   return token;
    // },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
