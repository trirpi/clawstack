import { NextAuthOptions, getServerSession } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

function normalizeEmail(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : undefined
}

function getPlatformAdminEmail() {
  return normalizeEmail(process.env.PLATFORM_ADMIN_EMAIL)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: (() => {
    const providers: NextAuthOptions['providers'] = [
      GitHubProvider({
        clientId: process.env.GITHUB_ID || '',
        clientSecret: process.env.GITHUB_SECRET || '',
      }),
    ]

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.push(
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      )
    }

    return providers
  })(),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        const platformAdminEmail = getPlatformAdminEmail()
        const sessionEmail = normalizeEmail(session.user.email ?? token.email)
        session.user.isPlatformAdmin = Boolean(
          platformAdminEmail && sessionEmail === platformAdminEmail,
        )
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }

      const platformAdminEmail = getPlatformAdminEmail()
      token.isPlatformAdmin = Boolean(
        platformAdminEmail && normalizeEmail(token.email) === platformAdminEmail,
      )
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user?.id) return null
  
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { publication: true },
  })
}
