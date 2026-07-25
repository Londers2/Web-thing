// lib/auth.js
import NextAuth from 'next-auth'
import YandexProvider from 'next-auth/providers/yandex'
import SequelizeAdapter from '@auth/sequelize-adapter'
import { sequelize, User, Account, Session, VerificationToken } from './db/index.js'

export const authOptions = {
  adapter: SequelizeAdapter(sequelize, {
    models: {
      User,
      Account,
      Session,
      VerificationToken,
    },
  }),
  providers: [
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID,
      clientSecret: process.env.YANDEX_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'login:info login:email login:birthday login:avatar login:default_phone',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'yandex') {
        user.phone = profile?.default_phone?.number || null
        user.birthday = profile?.birthday || null
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.phone = token.phone || null
        session.user.birthday = token.birthday || null
      }
      return session
    },
  },
}

export default NextAuth(authOptions)