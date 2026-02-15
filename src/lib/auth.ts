import { NextAuthOptions, getServerSession } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

function normalizeEmail(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : undefined
}

function getTemporaryReviewerConfig() {
  const username = typeof process.env.TEMP_REVIEWER_USERNAME === 'string'
    ? process.env.TEMP_REVIEWER_USERNAME.trim()
    : ''
  const password = typeof process.env.TEMP_REVIEWER_PASSWORD === 'string'
    ? process.env.TEMP_REVIEWER_PASSWORD
    : ''
  if (!username || !password) return null

  return {
    username,
    password,
    email: normalizeEmail(process.env.TEMP_REVIEWER_EMAIL) || 'stripe-reviewer@clawstack.local',
    name: (typeof process.env.TEMP_REVIEWER_NAME === 'string' && process.env.TEMP_REVIEWER_NAME.trim())
      ? process.env.TEMP_REVIEWER_NAME.trim()
      : 'Stripe Reviewer',
  }
}

function getPlatformAdminEmails() {
  const emails = new Set<string>()
  const platformAdminEmail = normalizeEmail(process.env.PLATFORM_ADMIN_EMAIL)
  if (platformAdminEmail) {
    emails.add(platformAdminEmail)
  }

  const reviewer = getTemporaryReviewerConfig()
  if (reviewer?.email) {
    emails.add(reviewer.email)
  }

  return emails
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

    const reviewer = getTemporaryReviewerConfig()
    if (reviewer) {
      providers.push(
        CredentialsProvider({
          id: 'reviewer',
          name: 'Reviewer',
          credentials: {
            username: { label: 'Username', type: 'text' },
            password: { label: 'Password', type: 'password' },
          },
          async authorize(credentials) {
            const currentReviewer = getTemporaryReviewerConfig()
            if (!currentReviewer) return null

            const username = typeof credentials?.username === 'string' ? credentials.username.trim() : ''
            const password = typeof credentials?.password === 'string' ? credentials.password : ''

            if (username !== currentReviewer.username || password !== currentReviewer.password) {
              return null
            }

            const user = await prisma.user.upsert({
              where: { email: currentReviewer.email },
              update: { name: currentReviewer.name },
              create: {
                email: currentReviewer.email,
                name: currentReviewer.name,
                bio: 'Temporary reviewer account for compliance verification.',
              },
            })

            return {
              id: user.id,
              email: user.email,
              name: user.name || currentReviewer.name,
            }
          },
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
        const platformAdminEmails = getPlatformAdminEmails()
        const sessionEmail = normalizeEmail(session.user.email ?? token.email)
        session.user.isPlatformAdmin = Boolean(
          sessionEmail && platformAdminEmails.has(sessionEmail),
        )
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }

      const platformAdminEmails = getPlatformAdminEmails()
      const tokenEmail = normalizeEmail(token.email)
      token.isPlatformAdmin = Boolean(
        tokenEmail && platformAdminEmails.has(tokenEmail),
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
