import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Notice } from '@/components/ui/Notice'
import {
  REPORT_REASON_LABELS,
  REPORT_REASON_VALUES,
  REPORT_STATUS_VALUES,
  type ReportReason,
  type ReportStatus,
} from '@/lib/moderation'

export const metadata = {
  title: 'Reports - Clawstack',
  description: 'Review and manage content reports',
}

type ReportStatusFilter = ReportStatus | 'ALL'
type ReportReasonFilter = ReportReason | 'ALL'

function normalizeFilter(value: string | undefined): ReportStatusFilter {
  if (!value) return 'ALL'
  return (REPORT_STATUS_VALUES as readonly string[]).includes(value) ? (value as ReportStatus) : 'ALL'
}

function normalizeReasonFilter(value: string | undefined): ReportReasonFilter {
  if (!value) return 'ALL'
  return (REPORT_REASON_VALUES as readonly string[]).includes(value) ? (value as ReportReason) : 'ALL'
}

function formatReason(reason: ReportReason | 'ALL') {
  if (reason === 'ALL') return 'All reasons'
  return REPORT_REASON_LABELS[reason]
}

function getPriority(reason: string, reportCountForPost: number, reporterCount: number) {
  if (reason === 'violent_extremism') return 'HIGH'
  if (reason === 'adult' || reason === 'copyright') return reportCountForPost >= 2 ? 'HIGH' : 'MEDIUM'
  if (reporterCount >= 3 || reportCountForPost >= 3) return 'MEDIUM'
  return 'LOW'
}

function isModerationSchemaError(error: unknown) {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes('p2021') ||
    message.includes('table') && message.includes('does not exist') ||
    message.includes('relation') && message.includes('does not exist')
  )
}

interface Props {
  searchParams: Promise<{ status?: string; reason?: string }>
}

interface ReportRow {
  id: string
  postId: string
  reason: string
  status: string
  createdAt: Date
  reporterEmail: string | null
  reporterIp: string | null
  details: string | null
  post: {
    id: string
    title: string
    slug: string
    published: boolean
  }
  publication: {
    id: string
    slug: string
    name: string
    userId: string
  }
}

export default async function ReportsPage({ searchParams }: Props) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  const isPlatformAdmin = session.user.isPlatformAdmin === true

  if (!isPlatformAdmin && !user?.publication) {
    redirect('/dashboard')
  }

  const publicationId = user?.publication?.id
  const scopeWhere = isPlatformAdmin ? {} : { publicationId }
  const { status, reason } = await searchParams
  const activeFilter = normalizeFilter(status)
  const activeReason = normalizeReasonFilter(reason)
  const where = {
    ...scopeWhere,
    ...(activeFilter === 'ALL' ? {} : { status: activeFilter }),
    ...(activeReason === 'ALL' ? {} : { reason: activeReason }),
  }

  const statusCounts: Record<ReportStatus, number> = {
    OPEN: 0,
    IN_REVIEW: 0,
    RESOLVED: 0,
    DISMISSED: 0,
  }
  const reasonCounts: Record<ReportReason, number> = {
    adult: 0,
    ip: 0,
    copyright: 0,
    violent_extremism: 0,
    other: 0,
  }
  const reportsByPostId = new Map<string, number>()
  const reportsByEmail = new Map<string, number>()
  const reportsByIp = new Map<string, number>()

  let reports: ReportRow[] = []
  let filteredCount = 0
  let totalReports = 0
  let missingModerationSchema = false

  try {
    const [
      reportRows,
      statusBreakdown,
      reasonBreakdown,
      postReportBreakdown,
      reporterEmailBreakdown,
      reporterIpBreakdown,
      filteredReportCount,
      totalReportCount,
    ] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          publication: {
            select: {
              id: true,
              slug: true,
              name: true,
              userId: true,
            },
          },
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
        where: scopeWhere,
        _count: { _all: true },
      }),
      prisma.report.groupBy({
        by: ['reason'],
        where: scopeWhere,
        _count: { _all: true },
      }),
      prisma.report.groupBy({
        by: ['postId'],
        where: scopeWhere,
        _count: { _all: true },
      }),
      prisma.report.groupBy({
        by: ['reporterEmail'],
        where: { ...scopeWhere, reporterEmail: { not: null } },
        _count: { _all: true },
      }),
      prisma.report.groupBy({
        by: ['reporterIp'],
        where: { ...scopeWhere, reporterIp: { not: null } },
        _count: { _all: true },
      }),
      prisma.report.count({ where }),
      prisma.report.count({ where: scopeWhere }),
    ])

    reports = reportRows
    filteredCount = filteredReportCount
    totalReports = totalReportCount

    for (const item of statusBreakdown) {
      if ((REPORT_STATUS_VALUES as readonly string[]).includes(item.status)) {
        statusCounts[item.status as ReportStatus] = item._count._all
      }
    }

    for (const item of reasonBreakdown) {
      if ((REPORT_REASON_VALUES as readonly string[]).includes(item.reason)) {
        reasonCounts[item.reason as ReportReason] = item._count._all
      }
    }

    for (const item of postReportBreakdown) {
      reportsByPostId.set(item.postId, item._count._all)
    }
    for (const item of reporterEmailBreakdown) {
      if (item.reporterEmail) {
        reportsByEmail.set(item.reporterEmail, item._count._all)
      }
    }
    for (const item of reporterIpBreakdown) {
      if (item.reporterIp) {
        reportsByIp.set(item.reporterIp, item._count._all)
      }
    }
  } catch (error) {
    if (isModerationSchemaError(error)) {
      missingModerationSchema = true
    } else {
      throw error
    }
  }

  function buildFilterHref(nextStatus: ReportStatusFilter, nextReason: ReportReasonFilter) {
    const params = new URLSearchParams()
    if (nextStatus !== 'ALL') params.set('status', nextStatus)
    if (nextReason !== 'ALL') params.set('reason', nextReason)
    const query = params.toString()
    return query ? `/dashboard/reports?${query}` : '/dashboard/reports'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-600">
              {isPlatformAdmin
                ? 'Review reports across all publications.'
                : 'Review reports for content in your publication.'}
            </p>
            <p className="text-xs text-gray-700 mt-1">
              {isPlatformAdmin
                ? 'Signed in as platform admin.'
                : 'Admin for this dashboard is the publication owner account.'}
            </p>
          </div>
          {!missingModerationSchema && (
            <Notice
              tone="info"
              message={`Showing ${Math.min(reports.length, filteredCount)} of ${filteredCount} filtered report${
                filteredCount === 1 ? '' : 's'
              } (${totalReports} total)`}
            />
          )}
        </div>

        {missingModerationSchema && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
            <h2 className="text-base font-semibold text-amber-900">Moderation storage is not initialized</h2>
            <p className="mt-2 text-sm text-amber-900/90">
              Reports table is missing in this environment. Run schema sync for your production database, then refresh.
            </p>
            <code className="mt-3 block rounded bg-amber-100 px-3 py-2 text-xs text-amber-950">
              npx prisma migrate deploy
            </code>
          </div>
        )}

        {!missingModerationSchema && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-600">Open</div>
            <div className="text-xl font-semibold text-gray-900">{statusCounts.OPEN}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-600">In Review</div>
            <div className="text-xl font-semibold text-gray-900">{statusCounts.IN_REVIEW}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-600">Resolved</div>
            <div className="text-xl font-semibold text-gray-900">{statusCounts.RESOLVED}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-600">Dismissed</div>
            <div className="text-xl font-semibold text-gray-900">{statusCounts.DISMISSED}</div>
          </div>
          </div>
        )}

        {!missingModerationSchema && (
          <div className="mb-6 flex flex-wrap gap-2">
          {(['ALL', ...REPORT_STATUS_VALUES] as const).map((filter) => {
            const isActive = activeFilter === filter
            const label = filter === 'ALL' ? 'All' : filter.replace('_', ' ')
            const count = filter === 'ALL' ? totalReports : statusCounts[filter]
            const href = buildFilterHref(filter, activeReason)

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
        )}
        {!missingModerationSchema && (
          <div className="mb-6 flex flex-wrap gap-2">
          {(['ALL', ...REPORT_REASON_VALUES] as const).map((filter) => {
            const isActive = activeReason === filter
            const label = formatReason(filter)
            const count = filter === 'ALL' ? totalReports : reasonCounts[filter]
            const href = buildFilterHref(activeFilter, filter)

            return (
              <Link
                key={filter}
                href={href}
                className={`rounded-full border px-3 py-1.5 text-sm capitalize ${
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
        )}

        {!missingModerationSchema && reports.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">No reports</h2>
            <p className="text-sm text-gray-600">
              When users report content, it will appear here.
            </p>
          </div>
        )}
        {!missingModerationSchema && reports.length > 0 && (
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
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="uppercase tracking-wide">Reported</span>
                      <span>{formatDate(report.createdAt)}</span>
                      <span>•</span>
                      <span className="uppercase tracking-wide">{report.reason.replaceAll('_', ' ')}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      {report.post.title}
                    </h3>
                    {isPlatformAdmin && (
                      <p className="mt-1 text-xs text-gray-600">
                        Publication: {report.publication.name}
                      </p>
                    )}
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
                        {REPORT_STATUS_VALUES.map((status) => (
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
                      href={`/${report.publication.slug}/${report.post.slug}`}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      View post
                    </a>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-700">
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
