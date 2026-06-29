// lib/auth.ts — NextAuth configuration
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Owner Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.username !== process.env.OWNER_USERNAME ||
          !credentials?.password
        ) return null

        const valid = await bcrypt.compare(
          credentials.password,
          process.env.OWNER_PASSWORD_HASH!
        )
        if (!valid) return null

        return { id: '1', name: 'Owner', email: process.env.OWNER_EMAIL }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return session
    },
  },
}
