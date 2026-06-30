import NextAuth from 'next-auth'
import YandexProvider from 'next-auth/providers/yandex'
import SequelizeAdapter from '@auth/sequelize-adapter'
import { sequelize, testConnection, syncDatabase, User, Account, Session, VerificationToken } from './db/index.js'

// Проверяем подключение к БД
;(async () => {
  try {
    await testConnection()
    
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase({ alter: true })
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error)
  }
})()

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
    async session({ session, user }) {
      if (user) {
        session.user.phone = user.phone
        session.user.birthday = user.birthday
      }
      return session
    },
  },
}

export default NextAuth(authOptions)