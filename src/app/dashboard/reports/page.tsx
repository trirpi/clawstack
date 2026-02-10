import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Notice } from '@/components/ui/Notice'

export const metadata = {
  title: 'Reports - Clawstack',
  description: 'Review and manage content reports',
}

const STATUS_OPTIONS = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'] as const
type ReportStatus = (typeof STATUS_OPTIONS)[number]
type ReportStatusFilter = ReportStatus | 'ALL'

function normalizeFilter(value: string | undefined): ReportStatusFilter {
  if (!value) return 'ALL'
  return (STATUS_OPTIONS as readonly string[]).includes(value) ? (value as ReportStatus) : 'ALL'
}

function getPriority(reason: string, reportCountForPost: number, reporterCount: number) {
  if (reason === 'violent_extremism') return 'HIGH'
  if (reason === 'adult' || reason === 'copyright') return reportCountForPost >= 2 ? 'HIGH' : 'MEDIUM'
  if (reporterCount >= 3 || reportCountForPost >= 3) return 'MEDIUM'
  return 'LOW'
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function ReportsPage({ searchParams }: Props) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()

  if (!user?.publication) {
    redirect('/dashboard')
  }
  const publication = user.publication
  const { status } = await searchParams
  const activeFilter = normalizeFilter(status)
  const where = {
    publicationId: publication.id,
    ...(activeFilter === 'ALL' ? {} : { status: activeFilter }),
  }

  const [reports, statusBreakdown, postReportBreakdown, reporterEmailBreakdown, reporterIpBreakdown] =
    await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              published: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.report.groupBy({
        by: ['status'],
        where: { publicationId: publication.id },
        _count: { _all: true },
      }),
      prisma.report.groupBy({
        by: ['postId'],
        where: { publicationId: publication.id },
        _count: { _all: true },
      }),
      prisma.report.groupBy({
        by: ['reporterEmail'],
        where: { publicationId: publication.id, reporterEmail: { not: null } },
        _count: { _all: true },
      }),
      prisma.report.groupBy({
        by: ['reporterIp'],
        where: { publicationId: publication.id, reporterIp: { not: null } },
        _count: { _all: true },
      }),
    ])

  const statusCounts: Record<ReportStatus, number> = {
    OPEN: 0,
    IN_REVIEW: 0,
    RESOLVED: 0,
    DISMISSED: 0,
  }
  for (const item of statusBreakdown) {
    if ((STATUS_OPTIONS as readonly string[]).includes(item.status)) {
      statusCounts[item.status as ReportStatus] = item._count._all
    }
  }

  const reportsByPostId = new Map(postReportBreakdown.map((item) => [item.postId, item._count._all]))
  const reportsByEmail = new Map(
    reporterEmailBreakdown
      .filter((item) => Boolean(item.reporterEmail))
      .map((item) => [item.reporterEmail as string, item._count._all]),
  )
  const reportsByIp = new Map(
    reporterIpBreakdown
      .filter((item) => Boolean(item.reporterIp))
      .map((item) => [item.reporterIp as string, item._count._all]),
  )
  const totalReports = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-600">
              Review reports for content in your publication.
            </p>
          </div>
          <Notice tone="info" message={`${reports.length} total report${reports.length === 1 ? '' : 's'}`} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">Open</div>
            <div className="text-xl font-semibold text-gray-900">{statusCounts.OPEN}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">In Review</div>
            <div className="text-xl font-semibold text-gray-900">{statusCounts.IN_REVIEW}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">Resolved</div>
            <div className="text-xl font-semibold text-gray-900">{statusCounts.RESOLVED}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">Dismissed</div>
            <div className="text-xl font-semibold text-gray-900">{statusCounts.DISMISSED}</div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(['ALL', ...STATUS_OPTIONS] as const).map((filter) => {
            const isActive = activeFilter === filter
            const label = filter === 'ALL' ? 'All' : filter.replace('_', ' ')
            const count = filter === 'ALL' ? totalReports : statusCounts[filter]
            const href = filter === 'ALL' ? '/dashboard/reports' : `/dashboard/reports?status=${filter}`

            return (
              <Link
                key={filter}
                href={href}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  isActive
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {label} ({count})
              </Link>
            )
          })}
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">No reports</h2>
            <p className="text-sm text-gray-600">
              When users report content, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    {(() => {
                      const countForPost = reportsByPostId.get(report.postId) || 1
                      const reporterCount = Math.max(
                        report.reporterEmail ? reportsByEmail.get(report.reporterEmail) || 1 : 1,
                        report.reporterIp ? reportsByIp.get(report.reporterIp) || 1 : 1,
                      )
                      const priority = getPriority(report.reason, countForPost, reporterCount)
                      const priorityStyles =
                        priority === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-700'

                      return (
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles}`}>
                            {priority} PRIORITY
                          </span>
                          {countForPost >= 3 && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                              Repeatedly reported post ({countForPost})
                            </span>
                          )}
                        </div>
                      )
                    })()}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="uppercase tracking-wide">Reported</span>
                      <span>{formatDate(report.createdAt)}</span>
                      <span>•</span>
                      <span className="uppercase tracking-wide">{report.reason}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      {report.post.title}
                    </h3>
                    {report.details && (
                      <p className="mt-2 text-sm text-gray-600">{report.details}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <form
                      action={`/api/reports/${report.id}`}
                      method="POST"
                    >
                      <select
                        name="status"
                        defaultValue={report.status as ReportStatus}
                        className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="outline" size="sm" className="ml-2">
                        Update
                      </Button>
                    </form>
                    {report.post.published && (
                      <form action={`/api/reports/${report.id}`} method="POST">
                        <input type="hidden" name="action" value="TAKEDOWN_RESOLVE" />
                        <Button type="submit" size="sm">
                          Take down + resolve
                        </Button>
                      </form>
                    )}
                    <a
                      href={`/${publication.slug}/${report.post.slug}`}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      View post
                    </a>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Reporter: {report.reporterEmail || report.reporterIp || 'Anonymous'} • Status: {report.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
